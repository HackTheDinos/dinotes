$(document).ready(function() {
   var userCardResults;
   var userInfo;

   $(".button-collapse").sideNav();

   $.get('/users/me')
      .success(function success(result) {
         var userInfo = result;
         // Fetch cards from backend
         userCardResults = getRecordsFrom('/notes/mine');

         // Remove null records based on a key to check
         userCardResults = returnValidCards(userCardResults.owned,
            'speciman-card-speciman-name');

         // Render validated records w/ Mustache into HTML
         renderMustache(
            'js/template-speciman-card.mst',
            userCardResults,
            '#loaded-speciman-cards');
      })
      .error(function failure(jqXHR, textStatus, errorThrown) {
         $('#modal1').openModal();
      });
});

/**
 * fetch from backend using express route
 * @param  {[String]} expressRoute
 * @return {[JSON]}
 */
function getRecordsFrom(expressRoute) {
   return JSON.parse($.ajax({
      type: "GET",
      url: expressRoute,
      async: false
   }).responseText);
}

/**
 * @param  {[String]} templatePath
 * @param  {[Array]} data        data to render
 * @param  {[String]} divId        div id to render into
 */
function renderMustache(templatePath, data, divId) {
   var rendered = '';
   var i;

   $.get(templatePath, function(template) {
      for (i = data.length - 1; i >= 0; i--) {
         rendered += Mustache.render(template, data[i].contents);
      }
      $(divId).html(rendered);
   });
}

/**
 * remove null records
 * @param  {[Array]} allCards
 * @param  {[String]} keyToCheck check this key for null value
 * @return {[Array]}            of valid records
 */
function returnValidCards(allCards, keyToCheck) {
   var validCards = [];
   var i;

   for (i = 0; i < allCards.length; i++) {
      if (allCards[i].contents[keyToCheck]) {
         validCards.push(allCards[i]);
      }
   }

   return validCards;
}
