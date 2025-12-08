using Microsoft.AspNetCore.Mvc;
using PopularDev.Application.DTOs;
using PopularDev.Application.DTOs.Detail;
using PopularDev.Application.Interfaces;

namespace PopularDev.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserDetailsController : ControllerBase
    {
        private readonly IUserDetailsService _service;

        public UserDetailsController(IUserDetailsService service)
        {
            _service = service;
        }

        [HttpPost("add-or-update")]
        public async Task<IActionResult> AddOrUpdate(UserDetailsRequestDto request)
        {
            var result = await _service.AddOrUpdateDetailsAsync(request);
            return Ok(result);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllUserDetailsAsync();
            return Ok(result);
        }

        [HttpDelete("{email}")]
        public async Task<IActionResult> Delete(string email)
        {
            var result = await _service.DeleteAsync(email);
            return Ok(new { message = result });
        }

        [HttpPut("admin/{email}")]
        public async Task<IActionResult> UpdateByAdmin(string email, UserDetailsRequestDto request)
        {
            var result = await _service.UpdateUserDetailsByAdminAsync(email, request);
            return Ok(new { message = result });
        }

    }
}
