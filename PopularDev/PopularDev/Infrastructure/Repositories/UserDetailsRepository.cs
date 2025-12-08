using Microsoft.EntityFrameworkCore;
using PopularDev.Domain.Entities;
using PopularDev.Domain.Interfaces;
using PopularDev.Infrastructure.Persistence;

namespace PopularDev.Infrastructure.Repositories
{
    public class UserDetailsRepository : IUserDetailsRepository
    {
        private readonly AppDbContext _context;
        public UserDetailsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserDetails?> GetByEmailAsync(string email)
        {
            return await _context.UserDetails
                .Include(u => u.UsersLogin)
                .FirstOrDefaultAsync(u => u.UsersLogin.Email == email);
        }

        public async Task AddAsync(UserDetails details)
        {
            await _context.UserDetails.AddAsync(details);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(UserDetails details)
        {
            _context.UserDetails.Update(details);
            await _context.SaveChangesAsync();
        }

        public async Task<List<UserDetails>> GetAllAsync()
        {
            return await _context.UserDetails
                 .Include(u => u.UsersLogin)
                 .ToListAsync();
        }

        public async Task DeleteAsync(UserDetails details)
        {
            _context.UserDetails.Remove(details);
            await _context.SaveChangesAsync();
        }
    }
}
