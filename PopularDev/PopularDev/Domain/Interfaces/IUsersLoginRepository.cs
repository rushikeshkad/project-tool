using PopularDev.Domain.Entities;

namespace PopularDev.Domain.Interfaces
{
    public interface IUsersLoginRepository
    {
        Task<UsersLogin?> GetByEmailAsync(string email);
        Task AddAsync(UsersLogin usersLogin);

        
    }
}
