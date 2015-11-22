$('.submit-speciman-card').click(function submitSpeciman() {
   var newCardObject = {};
   var currentId;

   $('.speciman-card-input').each(function() {
      currentId = $(this).attr('id');
      newCardObject[currentId] = $(this).val();
   });

   $.post('/notes/new', newCardObject, 'json');
});
