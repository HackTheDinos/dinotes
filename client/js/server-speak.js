$('.submit-speciman-card').click(function submitSpeciman() {
   var newCardObject = getAllFields('.speciman-card-input');
   $.post('/notes/new', newCardObject, 'json');

   location.reload();
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
