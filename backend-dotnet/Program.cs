using System.Collections.Concurrent;
using System.Linq;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .GetChildren()
    .Select(c => c.Value)
    .Where(v => !string.IsNullOrWhiteSpace(v))
    .ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AppCors", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.ConfigureHttpJsonOptions(opts =>
{
    opts.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

var app = builder.Build();
var env = app.Environment;

// Optional PathBase support for deployments under a sub-path (e.g. /api)
var configuredPathBase = app.Configuration["PathBase"] ?? Environment.GetEnvironmentVariable("ASPNETCORE_PATHBASE");
if (!string.IsNullOrWhiteSpace(configuredPathBase))
{
    app.UsePathBase(configuredPathBase);
}

// Respect proxy headers from Cloudflare/Azure
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// Enforce HTTPS and HSTS in production
app.UseHttpsRedirection();
if (!env.IsDevelopment())
{
    app.UseHsts();
}

// CORS only needed for local development; in production we serve same-origin
if (env.IsDevelopment())
{
    app.UseCors("AppCors");
}

// In-memory session store
var sessions = new ConcurrentDictionary<string, Session>();

app.MapPost("/auth/verify-otp", async (HttpContext ctx) =>
{
    var payload = await ctx.Request.ReadFromJsonAsync<UserOtpRequest>();
    if (payload is null || string.IsNullOrWhiteSpace(payload.Phone) || string.IsNullOrWhiteSpace(payload.Otp))
    {
        return Results.BadRequest(new { error = "Parámetros inválidos" });
    }

    if (payload.Otp != "123456")
    {
        return Results.Unauthorized();
    }

    var sessionId = Guid.NewGuid().ToString("N");
    var userName = $"User-{payload.Phone[^Math.Min(4, payload.Phone.Length)..]}";
    var session = new Session(Id: sessionId, Role: "user", UserName: userName, AdminName: null, CreatedAt: DateTimeOffset.UtcNow);
    sessions[sessionId] = session;

    SetSessionCookie(ctx, sessionId);
    return Results.Ok(new { ok = true, role = session.Role, userName });
});

app.MapPost("/auth/login-admin", async (HttpContext ctx) =>
{
    var payload = await ctx.Request.ReadFromJsonAsync<AdminLoginRequest>();
    if (payload is null || string.IsNullOrWhiteSpace(payload.Email) || string.IsNullOrWhiteSpace(payload.Password))
    {
        return Results.BadRequest(new { error = "Parámetros inválidos" });
    }

    // Hardcoded admin credentials
    if (!string.Equals(payload.Email, "admin@example.com", StringComparison.OrdinalIgnoreCase) || payload.Password != "password123")
    {
        return Results.Unauthorized();
    }

    var sessionId = Guid.NewGuid().ToString("N");
    var adminName = "Administrador";
    var session = new Session(Id: sessionId, Role: "admin", UserName: null, AdminName: adminName, CreatedAt: DateTimeOffset.UtcNow);
    sessions[sessionId] = session;

    SetSessionCookie(ctx, sessionId);
    return Results.Ok(new { ok = true, role = session.Role, adminName });
});

app.MapGet("/session/me", (HttpContext ctx) =>
{
    if (!TryGetSession(ctx, sessions, out var session))
    {
        return Results.Unauthorized();
    }
    return Results.Ok(new
    {
        authenticated = true,
        role = session!.Role,
        userName = session.UserName,
        adminName = session.AdminName,
        createdAt = session.CreatedAt
    });
});

app.MapPost("/auth/logout", (HttpContext ctx) =>
{
    var cookieName = GetCookieName();
    if (ctx.Request.Cookies.TryGetValue(cookieName, out var sid))
    {
        sessions.TryRemove(sid, out _);
    }
    ctx.Response.Cookies.Delete(cookieName, new CookieOptions
    {
        HttpOnly = true,
        Secure = IsProduction(ctx),
        SameSite = SameSiteMode.Lax,
        Path = "/"
    });
    return Results.Ok(new { ok = true });
});

app.Run();

static bool TryGetSession(HttpContext ctx, ConcurrentDictionary<string, Session> sessions, out Session? session)
{
    session = null;
    var cookieName = GetCookieName();
    if (!ctx.Request.Cookies.TryGetValue(cookieName, out var sid))
    {
        return false;
    }
    if (!sessions.TryGetValue(sid, out var s))
    {
        return false;
    }
    session = s;
    return true;
}

static string GetCookieName() => "session_id";

static void SetSessionCookie(HttpContext ctx, string sessionId)
{
    ctx.Response.Cookies.Append(GetCookieName(), sessionId, new CookieOptions
    {
        HttpOnly = true,
        Secure = IsProduction(ctx),
        SameSite = SameSiteMode.Lax,
        Path = "/",
        Expires = DateTimeOffset.UtcNow.AddHours(8)
    });
}

static bool IsProduction(HttpContext ctx)
{
    var env = ctx.RequestServices.GetRequiredService<IHostEnvironment>();
    return env.IsProduction();
}

record Session(string Id, string Role, string? UserName, string? AdminName, DateTimeOffset CreatedAt);

record UserOtpRequest(string Phone, string Otp);

record AdminLoginRequest(string Email, string Password);

