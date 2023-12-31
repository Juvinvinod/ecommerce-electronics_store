$(document).ready(() => {
  $('.delete').on('click', function (e) {
    e.preventDefault();
    const self = $(this);
    console.log(self);
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        location.href = self.attr('href');
      }
    });
  });
});
