$('.submit-speciman-card').click(function submitSpeciman() {
   var newCardObject = getAllFields('.speciman-card-input');

   var file = document.getElementById('speciman-card-img').files[0]; //Files[0] = 1st file

   if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function(event) {
         var dataURL = reader.result;
         newCardObject.img = dataURL;
         $.post('/notes/new', newCardObject, 'json');
         location.reload();
      };
   } else {
      $.post('/notes/new', newCardObject, 'json');
      location.reload();
   }

});

$('.dino-reg-login').click(function login() {
   var userInfo = getAllFields('.dino-reg-login-input');
   $.get('users/create', userInfo, function() {
      $.get('users/login', userInfo);
   });

});

function getAllFields(inputClass) {
   var newObject = {};
   var currentId;

   $(inputClass).each(function() {
      currentId = $(this).attr('id');
      newObject[currentId] = $(this).val();
   });

   return newObject;
}
