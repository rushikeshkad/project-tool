using PopularDev.Application.DTOs.Auth;
using PopularDev.Domain.Entities;


namespace PopularDev.Application.Interfaces
{
    public interface IUsersLoginService
    {
        Task<string> RegisterAsync(RegisterRequestDto request);
        Task<string> LoginAsync(LoginRequestDto request);
        Task<string> LogoutAsync();

    }
}
