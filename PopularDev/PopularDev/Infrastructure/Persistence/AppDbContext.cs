using Microsoft.EntityFrameworkCore;
using PopularDev.Domain.Entities;

namespace PopularDev.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) 
        {
        
        }
        public DbSet<UsersLogin> UsersLogin { get; set; }
        public DbSet<UserDetails> UserDetails { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UsersLogin>()
                .HasKey(x => x.LoginId);

            modelBuilder.Entity<UserDetails>()
                .HasOne(x => x.UsersLogin)
                .WithOne()
                .HasForeignKey<UserDetails>(x => x.UserLoginId);
        }
    }
}