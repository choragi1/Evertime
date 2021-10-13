function notLogin() {
    Swal.fire({
        icon: 'error',
        title: '로그인 후 이용 가능합니다.',
        })
        $('.swal2-confirm').click(()=>{
        $("#login").click();
        $("#user_id").focus();
        }) 
  }

  module.exports = {
      notLogin
  }