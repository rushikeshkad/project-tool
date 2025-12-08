using Microsoft.EntityFrameworkCore;
using PopularDev.Domain.Entities;
using PopularDev.Domain.Interfaces;
using PopularDev.Infrastructure.Persistence;

namespace PopularDev.Infrastructure.Repositories
{
    public class UserLoginRepository : IUsersLoginRepository
    {
        private readonly AppDbContext _context;

        public UserLoginRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(UsersLogin usersLogin)
        {
            await _context.UsersLogin.AddAsync(usersLogin);
            await _context.SaveChangesAsync();
        }

        public async Task<UsersLogin?> GetByEmailAsync(string email)
        {
            return await _context.UsersLogin
                .FirstOrDefaultAsync(u => u.Email == email);
        }

    }
}
