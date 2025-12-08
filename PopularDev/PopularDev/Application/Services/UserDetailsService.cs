using PopularDev.Application.DTOs;
using PopularDev.Application.DTOs.Detail;
using PopularDev.Application.Interfaces;
using PopularDev.Domain.Entities;
using PopularDev.Domain.Interfaces;

namespace PopularDev.Application.Services
{
    public class UserDetailsService : IUserDetailsService
    {
        private readonly IUserDetailsRepository _repository;
        private readonly IUsersLoginRepository _loginRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserDetailsService(
            IUserDetailsRepository repository,
            IUsersLoginRepository loginRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _loginRepository = loginRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<string> AddOrUpdateDetailsAsync(UserDetailsRequestDto request)
        {
            var email = _httpContextAccessor.HttpContext!.Session.GetString("UserEmail");

            if (string.IsNullOrEmpty(email))
                return "Session expired, please login again";

            var user = await _loginRepository.GetByEmailAsync(email);
            if (user == null) return "User not found";

            var existing = await _repository.GetByEmailAsync(email);

            if (existing == null)
            {
                var details = new UserDetails
                {
                    UserLoginId = user.LoginId,
                    Name = request.Name,
                    EmpId = request.EmpId,
                    MachineIpAddress = request.MachineIpAddress,
                    DeviceHostName = request.DeviceHostName,
                    ClientVpnUsername = request.ClientVpnUsername,
                    AssetId = request.AssetId,
                    ContactNo = request.ContactNo,
                    BitLockerPassword = request.BitLockerPassword,
                    Location = request.Location,
                    VdiPhysicalMachineLocation = request.VdiPhysicalMachineLocation,
                    HwfhPwfH = request.HwfhPwfH
                };

                await _repository.AddAsync(details);
                return "User details added successfully";
            }

            // Update existing
            existing.Name = request.Name;
            existing.EmpId = request.EmpId;
            existing.MachineIpAddress = request.MachineIpAddress;
            existing.DeviceHostName = request.DeviceHostName;
            existing.ClientVpnUsername = request.ClientVpnUsername;
            existing.AssetId = request.AssetId;
            existing.ContactNo = request.ContactNo;
            existing.BitLockerPassword = request.BitLockerPassword;
            existing.Location = request.Location;
            existing.VdiPhysicalMachineLocation = request.VdiPhysicalMachineLocation;
            existing.HwfhPwfH = request.HwfhPwfH;

            await _repository.UpdateAsync(existing);
            return "User details updated successfully";
        }
        public async Task<List<UserDetailsResponseDto>> GetAllUserDetailsAsync()
        {
            var result = await _repository.GetAllAsync();

            return result.Select(u => new UserDetailsResponseDto
            {
                Email = u.UsersLogin.Email,
                Name = u.Name,
                EmpId = u.EmpId,
                MachineIpAddress = u.MachineIpAddress,
                DeviceHostName = u.DeviceHostName,
                ClientVpnUsername = u.ClientVpnUsername,
                AssetId = u.AssetId,
                ContactNo = u.ContactNo,
                BitLockerPassword = u.BitLockerPassword,
                Location = u.Location,
                VdiPhysicalMachineLocation = u.VdiPhysicalMachineLocation,
                HwfhPwfH = u.HwfhPwfH
            }).ToList();
        }

        public async Task<string> DeleteAsync(string email)
        {
            var existing = await _repository.GetByEmailAsync(email);

            if (existing == null)
                return "User details not found";

            await _repository.DeleteAsync(existing);
            return "User deleted successfully";
        }

        public async Task<string> UpdateUserDetailsByAdminAsync(string email, UserDetailsRequestDto request)
        {
            var existing = await _repository.GetByEmailAsync(email);

            if (existing == null)
                return "User details not found";

            existing.Name = request.Name;
            existing.EmpId = request.EmpId;
            existing.MachineIpAddress = request.MachineIpAddress;
            existing.DeviceHostName = request.DeviceHostName;
            existing.ClientVpnUsername = request.ClientVpnUsername;
            existing.AssetId = request.AssetId;
            existing.ContactNo = request.ContactNo;
            existing.BitLockerPassword = request.BitLockerPassword;
            existing.Location = request.Location;
            existing.VdiPhysicalMachineLocation = request.VdiPhysicalMachineLocation;
            existing.HwfhPwfH = request.HwfhPwfH;

            await _repository.UpdateAsync(existing);

            return "User details updated successfully";
        }

    }
}
