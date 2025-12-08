using PopularDev.Domain.Entities;

namespace PopularDev.Domain.Interfaces
{
    public interface IUserDetailsRepository
    {
        Task<UserDetails?> GetByEmailAsync(string email);
        Task AddAsync(UserDetails details);
        Task UpdateAsync(UserDetails details);
        Task<List<UserDetails>> GetAllAsync();
        Task DeleteAsync(UserDetails details);
    }
}
