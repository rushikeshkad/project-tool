namespace PopularDev.Domain.Entities
{
    public class UsersLogin
    {
        public Guid LoginId { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;


    }
}
