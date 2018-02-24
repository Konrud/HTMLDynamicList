;(function (ns) {
  "use strict";
  
  /*
  TODO:
  1. Add method refresh() that will refresh list's data after deletion or some other action (e.g. get new data from server and display it)
  */
  
    
  /*=======================================*\
              CONSTANTS/VARIABLES
  /*=======================================*/
  const LIST_IDENTITY_CLASS = "o-dynamic-list";
  const LIST_ITEM_IDENTITY_CLASS = "o-dynamic-list__item";
  const LIST_ITEM_VISIBLE_ATTR = "data-visible";
  const LIST_ITEM_INDEX_ATTR = "data-index";
  const LIST_ITEM_VISIBLE_INDEX_ATTR = "data-visible-index";
  const LIST_ITEM_SELECTED_ATTR = "data-selected";


  function List (options) {
   
    /// default options
    const defOpts = {
      listWrapper: document.body, // where our list will be located
      listTag: "ul",
      listItemTag: "li",
      listClasses: [], // each class should be set as a new array item (e.g. ["first-class", "second-class"])
      listItemClasses: [], // each class should be set as a new array item (e.g. ["first-class", "second-class"])
      dataObjects: [], // array of data for each list item (e.g. title, text, etc....)
      firstIndex: 0, // index in the @dataObjects from which list will start rendering
      selectedIndex: 0, // index of the item, from the visible items array, which should be denoted as selected
      onBeforeDisplay: function () {},
      onDisplay: null, // During the rendering phase we will check and throw an Error if onDisplay function wasn't provided
      onAfterDisplay: function () {},
      // onRefreshUI: function () {}
    };
    
    defOpts.listHTMLElement = null;
    
    // data for each list item after rendering (includes added properties like isVisible, etc...)
    defOpts.listItemsData = [];

    /// number of items to be displayed from the @dataObjects array
    defOpts.numberOfVisibleItems = options.dataObjects && options.dataObjects.length;
    
    if(_isObject(options))
      Object.assign(defOpts, options);
    
    /// array of visually visible items of the list (depends on @numberOfVisibleItems property)
    this.visibleItems = [];
    
    Object.defineProperty(this, "selectedIndex", { get: function () { return defOpts.firstIndex; } });
    Object.defineProperty(this, "firstIndex", { get: function () { return defOpts.firstIndex; } });
    
    defOpts.onBeforeDisplay(defOpts.dataObjects); // the last chance to change provided data before rendering
    _displayItems(this, defOpts);    
    defOpts.onAfterDisplay([].concat(defOpts.listItemsData)); // passed in all data for rendered list items
    
      if(defOpts.listHTMLElement) {
        const listItemElem = defOpts.listHTMLElement.firstElementChild;
        const listItemStyle = window.getComputedStyle(listItemElem);
        defOpts.listItemHeightOffset = listItemElem.offsetHeight + parseFloat(listItemStyle.marginTop) + parseFloat(listItemStyle.marginBottom);
      };
    
    List.prototype.scrollForwards = scrollForwards.bind(this, defOpts);
    List.prototype.scrollBackwards = scrollBackwards.bind(this, defOpts);
  };

  
    /*=======================================*\
                EVENT HANDLERS
    /*=======================================*/
  
  
    /*=======================================*\
                PUBLIC METHODS
    /*=======================================*/
    
    function scrollForwards (defOpts) {
      
      let selectedIndex = defOpts.listItemsData.findIndex(function (item) {
        return item.isSelected === true;
      });
      
      if(selectedIndex > -1) {
         
         let selectedItem = defOpts.listItemsData[selectedIndex];

         selectedItem.isSelected = false; // previous selected item is not selected anymore
      
         defOpts.listHTMLElement.children[selectedIndex].setAttribute(LIST_ITEM_SELECTED_ATTR, selectedItem.isSelected);
        
         selectedIndex += 1;
         
         if(selectedIndex >= defOpts.listItemsData.length) {
            if(selectedIndex >= defOpts.dataObjects.length) {
              selectedIndex = defOpts.dataObjects.length - 1;
            }  else { /// load new items
            }
         }
        // new/next item to be selected
        selectedItem = defOpts.listItemsData[selectedIndex];
        selectedItem.isSelected = true;
        
        if(selectedItem.isVisible === false) {
          defOpts.listHTMLElement.style.transform = "translateY(-" + defOpts.listItemHeightOffset + "px)";
          
          selectedItem.isVisible = true;         
        
          defOpts.listHTMLElement.children[selectedIndex].setAttribute(LIST_ITEM_VISIBLE_ATTR, selectedItem.isVisible);
        }
        
        defOpts.listHTMLElement.children[selectedIndex].setAttribute(LIST_ITEM_SELECTED_ATTR, selectedItem.isSelected);
      }
      
    };
  
  
    function scrollBackwards (defOpts) {
      
      let selectedIndex = defOpts.listItemsData.findIndex(function (item) {
        return item.isSelected === true;
      });
      
      
      if(selectedIndex > -1) {
        
        let selectedItem = defOpts.listItemsData[selectedIndex];

        selectedItem.isSelected = false; // previous selected item is not selected anymore
      
        defOpts.listHTMLElement.children[selectedIndex].setAttribute(LIST_ITEM_SELECTED_ATTR, selectedItem.isSelected);
        
         selectedIndex -= 1;
         
         if(selectedIndex < defOpts.listItemsData[0].index) {
            if(selectedIndex < 0) {
               selectedIndex = 0;
            }  else { /// load new items
            }
         }
        
        selectedItem = defOpts.listItemsData[selectedIndex];
        selectedItem.isSelected = true;
        
        if(selectedItem.isVisible === false) {
          defOpts.listHTMLElement.style.transform = "translateY(" + defOpts.listItemHeightOffset + ")";
          selectedItem.isVisible = true;
        }
        
        defOpts.listHTMLElement.children[selectedIndex].setAttribute(LIST_ITEM_SELECTED_ATTR, selectedItem.isSelected);
      }
    };
  
  
  
    function scrollTo (index) {
      
    };
  
  
  
    /*=======================================*\
                PRIVATE FUNCTIONS
    /*=======================================*/
  
  
    function _displayItems (list, defOpts) {
      const listOpts = defOpts;
      
      if(_isFunction(listOpts.onDisplay) === false) {
        throw new Error("List Error: function for onDisplay event is not provided.");
      };
      
      
      const renderedItemsAmount = (listOpts.numberOfVisibleItems + 1 + 2); /*+ 1 == acount for zero base index | + 2 number of invisible but preloaded items that will reside below the visible items*/ 
      
      let visibleItemsAmount = listOpts.numberOfVisibleItems;
      
      const endIndex = renderedItemsAmount < listOpts.dataObjects.length  ? renderedItemsAmount : listOpts.dataObjects.length;
      
      let listItemsTemplateStr = ""; // accumulate all list items string templates to one
      
      const listHTMLElement = document.createElement(listOpts.listTag);
      
      listHTMLElement.className = LIST_IDENTITY_CLASS;
       
      /// add additional classes defined by the user
      listHTMLElement.classList.add.apply(listHTMLElement.classList, listOpts.listClasses);
      
      const tempHTMLDocFrag = document.createDocumentFragment();
      
      for(let i = listOpts.firstIndex; i < endIndex; i++) {
          const dataObj = listOpts.dataObjects[i];
         
         
           const listItemData = {
              data: dataObj,
              index: i,
              isVisible: false,
              isSelected: listOpts.selectedIndex === i
            };

        
            defOpts.listItemsData.push(listItemData);
        
            if(visibleItemsAmount-- > 0) {
              listItemData.isVisible = true;
              listItemData.visibleIndex = list.visibleItems.length;
              list.visibleItems.push(listItemData);
            };
              
          const listItem = document.createElement(listOpts.listItemTag);
         
          listItem.className = LIST_ITEM_IDENTITY_CLASS;

          /// add additional classes defined by the user
          listItem.classList.add.apply(listItem.classList, listOpts.listItemClasses);

          listItem.setAttribute(LIST_ITEM_VISIBLE_ATTR, listItemData.isVisible);
          listItem.setAttribute(LIST_ITEM_SELECTED_ATTR, listItemData.isSelected);
          listItem.setAttribute(LIST_ITEM_INDEX_ATTR, listItemData.index);
        
          if(listItemData.visibleIndex != undefined) // visibleIndex can be 0
          listItem.setAttribute(LIST_ITEM_VISIBLE_INDEX_ATTR, listItemData.visibleIndex);
        
          const templateStr = listOpts.onDisplay(listItemData);

          listItem.innerHTML = templateStr || "";
            
          tempHTMLDocFrag.appendChild(listItem);
      };
      
      listHTMLElement.appendChild(tempHTMLDocFrag);
      listOpts.listWrapper.appendChild(listHTMLElement);
      
      listOpts.listHTMLElement = listHTMLElement;
    };
  
    /**
    * Determines whether provided parameter is a plain object
    * @param {Object} obj - Object to check.
    * @return {Boolean} - TRUE if provided parameter is a plain object, otherwise returns FALSE
    */
    function _isObject (obj) {
        return typeof obj === "object" && !obj.length;
    };
  
    /**
    * Determines whether provided parameter is a function
    * @param {Object} valueToCheck - Value to check whether it a function.
    * @return {Boolean} - TRUE if provided parameter is a function, otherwise returns FALSE
    */
    function _isFunction (valueToCheck) {
      return typeof valueToCheck === "function";
    };
 
  
    /*----Prototype Methods----*/

    const prototypeMethods = {
        /*Add Public API Methods HERE*/
    };

    Object.assign(List.prototype, prototypeMethods);

    // assign List to the namespace
    ns.List = List;

    
})(window.app || (window.app = {}));
