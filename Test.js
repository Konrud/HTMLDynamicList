;(function () {
  "use strict";
  
  const listWrapper = document.getElementById("listWrapper");
  const templateElem = document.getElementById("list-item-template");
  
  const btnUp = document.getElementById("btn-up");
  const btnDown = document.getElementById("btn-down");
  
  const listItemsData = getListItemsData();
  
  
  const optsForList = {
    listWrapper: listWrapper,
    listClasses: ["o-list", "c-main-container__list"],
    listItemClasses: ["o-list__item", "c-main-container__list-item"],
    dataObjects: listItemsData,
    numberOfVisibleItems: 2,
    firstIndex: 1,
    selectedIndex: 1,
    onBeforeDisplay: listOnBeforeDisplay,
    onDisplay: listOnDisplay,
    onAfterDisplay: listOnAfterDisplay,
    // onRefreshUI: listOnRefreshUI
  }
  
  const list = new window.app.List(optsForList);
  

//   const optsForList2 = {
//     listWrapper: listWrapper,
//     listClasses: ["o-list", "c-main-container__list"],
//     listItemClasses: ["o-list__item", "c-main-container__list-item"],
//     dataObjects: listItemsData,
//     numberOfVisibleItems: 2,
//     firstIndex: 2,
//     selectedIndex: 3,
//     onDisplay: listOnDisplay,
//   }

//   const list2 = new window.app.List(optsForList2);
  
  /*Adding Event Handlers*/
  btnUp.addEventListener("click", buttonUpOnClick);
  btnDown.addEventListener("click", buttonDownOnClick);
  
  
  /*  Event Handlers
  ==============================*/
  function listOnBeforeDisplay (data) {
    debugger;
  };
  
  
  function listOnDisplay (listItemData) {
    return getTemplateContent(listItemData.data, templateElem);
  };
  
  
  function listOnAfterDisplay (listItemsData) {
    debugger;
  };
  
  
  function buttonUpOnClick () {
    list.scrollBackwards();
  };
  
  function buttonDownOnClick () {
    list.scrollForwards();
  };
  
  /*  Utilities
  ==============================*/
  
  
    /*
    * Gets compiled template with inserted data.
    * @param {Object} dataObj - Object with data to set the template from
    * @param {HTMLElement} templateElem - HTML element which represents the template
    * @return {String} - Set template with data.
    */
    function getTemplateContent (dataObj, templateElem) {
        //// Render projects Templates
        var handlebarsProjectTemplate = Handlebars.compile(templateElem.innerText)(dataObj);
        return handlebarsProjectTemplate;
    };
  
  
  
  
  
    function getListItemsData () {
      return [
          {
            textValue: "First List Item",
            buttonLabel: "First Button"
          },
          {
            textValue: "Second List Item",
            buttonLabel: "Second Button"
          },
          {
            textValue: "Third List Item",
            buttonLabel: "Third Button"
          },
          {
            textValue: "Fourth List Item",
            buttonLabel: "Fourth Button"
          },
          {
            textValue: "Fifth List Item",
            buttonLabel: "Fifth Button"
          },
        ];
    };
  
})();
