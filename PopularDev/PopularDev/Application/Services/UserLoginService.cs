using Microsoft.AspNetCore.Identity;
using PopularDev.Application.DTOs.Auth;
using PopularDev.Application.Interfaces;
using PopularDev.Domain.Entities;
using PopularDev.Domain.Interfaces;

namespace PopularDev.Application.Services
{
    public class UserLoginService : IUsersLoginService
    {
        private readonly IUsersLoginRepository _usersLoginRepository;
        private readonly PasswordHasher<UsersLogin> _passwordHasher = new PasswordHasher<UsersLogin>();
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserLoginService(IUsersLoginRepository usersLoginRepository, IHttpContextAccessor httpContextAccessor)
        {
            _usersLoginRepository = usersLoginRepository;
            _httpContextAccessor = httpContextAccessor;   
        }

        public async Task<string> RegisterAsync(RegisterRequestDto request)
        {
            var existingUser = await _usersLoginRepository.GetByEmailAsync(request.Email);

            if (existingUser != null)
                return "User already exists";

            var user = new UsersLogin
            {
                LoginId = Guid.NewGuid(),
                Name = request.Name,
                Email = request.Email
            };

            user.Password = _passwordHasher.HashPassword(user, request.Password);

            await _usersLoginRepository.AddAsync(user);

            return "User registered successfully";
        }

        public async Task<string> LoginAsync(LoginRequestDto request)
        {
            var existingUser = await _usersLoginRepository.GetByEmailAsync(request.Email);

            if (existingUser == null)
                return "User not found";

            var passwordVerification = _passwordHasher.VerifyHashedPassword(existingUser, existingUser.Password, request.Password);

            if (passwordVerification == PasswordVerificationResult.Failed)
                return "Invalid password";

            return "Login Successful";
        }

        public Task<string> LogoutAsync()
        {
            _httpContextAccessor.HttpContext!.Session.Remove("UserEmail");
            return Task.FromResult("Logged out successfully");
        }
    }
}
