loadPolyfills ();
;(function (ns) {
  "use strict";

  /*
  TODO:
  1. Add method refresh() that will refresh list's data after deletion or some other action (e.g. get new data from server and display it)
  2. Add IntersectionObserver on each listItem element in order to observe when listItem is enterd/exited visible area of the list
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
 
        
    const intersectionObserverOptions = {
      root: defOpts.listWrapper,
      rootMargin: "0px 0px 0px"
    };
    
    defOpts.intersectionObserver = new IntersectionObserver(_handleListItemsIntersection, intersectionObserverOptions);
    
    /// array of visually visible items of the list (depends on @numberOfVisibleItems property)
    this.visibleItems = [];
    
    Object.defineProperty(this, "selectedIndex", { get: function () { return defOpts.firstIndex; } });
    Object.defineProperty(this, "firstIndex", { get: function () { return defOpts.firstIndex; } });
    
    getListItemData = getListItemData.bind(this, defOpts);
    getCurrentSelectedItem = getCurrentSelectedItem.bind(this, defOpts);
    _toggleListItemVisibility = _toggleListItemVisibility.bind(this);
    
    defOpts.onBeforeDisplay(defOpts.dataObjects); // the last chance to change provided data before rendering
    _renderListItems(this, defOpts);   
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
      debugger;
      let currentSelectedItem = getCurrentSelectedItem();
      
      let selectedIndex = currentSelectedItem ? currentSelectedItem.index : -1;
      
      if(selectedIndex > -1) {
 
         currentSelectedItem.isSelected = false; // previous selected item is not selected anymore
      
         currentSelectedItem.listItemHTML.setAttribute(LIST_ITEM_SELECTED_ATTR, currentSelectedItem.isSelected);
        
         selectedIndex += 1;
          
         if(selectedIndex >= defOpts.listItemsData.length) {
            if(selectedIndex >= defOpts.dataObjects.length) {
              selectedIndex = defOpts.dataObjects.length - 1;
            }  else { /// load new items
              ///defOpts.dataObjects[selectedIndex];
            }
         }
        // new/next item to be selected
        currentSelectedItem = defOpts.listItemsData[selectedIndex];
        debugger;
        currentSelectedItem.isSelected = true;
        
        if(currentSelectedItem.isVisible === false) {
          defOpts.listHTMLElement.style.transform = "translateY(-" + defOpts.listItemHeightOffset + "px)";                
          // defOpts.listHTMLElement.children[selectedIndex].setAttribute(LIST_ITEM_VISIBLE_ATTR, selectedItem.isVisible);
        }
        /*TODO: maybe we should define setSelectedItem method?*/
        currentSelectedItem.listItemHTML.setAttribute(LIST_ITEM_SELECTED_ATTR, currentSelectedItem.isSelected);
        // defOpts.onRefreshUI(defOpts.listItemsData);
      }
      
    };
   
  
    function scrollBackwards (defOpts) {

      let currentSelectedItem = getCurrentSelectedItem();
      
      let selectedIndex = currentSelectedItem ? currentSelectedItem.index : -1;
       
      if(selectedIndex > -1) {

        currentSelectedItem.isSelected = false; // previous selected item is not selected anymore
      
        currentSelectedItem.listItemHTML.setAttribute(LIST_ITEM_SELECTED_ATTR, currentSelectedItem.isSelected);
        
         selectedIndex -= 1;
         
         if(selectedIndex < defOpts.listItemsData[0].index) {
            if(selectedIndex < 0) {
               selectedIndex = 0;
            }  else { /// load new items
              ///defOpts.dataObjects[selectedIndex];
            }
         }
       
        currentSelectedItem = defOpts.listItemsData[selectedIndex];
        currentSelectedItem.isSelected = true;
        debugger;
        if(currentSelectedItem.isVisible === false) {
          defOpts.listHTMLElement.style.transform = "translateY(" + defOpts.listItemHeightOffset + "px)";
        }
        
        currentSelectedItem.listItemHTML.setAttribute(LIST_ITEM_SELECTED_ATTR, currentSelectedItem.isSelected);
        // defOpts.onRefreshUI(defOpts.listItemsData);
      }
    };
  
  
    function scrollTo (index) {
      
    };
  
      
    function getListItemData (defOpts, index) {
      index = parseInt(index);
      const foundListItem = defOpts.listItemsData.find(function (elem) {
        return elem.index === index;
      });
      return foundListItem;
    };
  
  
    function getCurrentSelectedItem (defOpts) {
      let selectedItem = defOpts.listItemsData.find(function (item) {
        return item.isSelected === true;
      });
      return selectedItem;
    };
  
   
    /*=======================================*\
                PRIVATE FUNCTIONS
    /*=======================================*/
  
  
    function _renderListItems (list, defOpts) {
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
      
      for(let i = listOpts.firstIndex, j = 0; i < endIndex; i++, j++) {
         const dataObj = listOpts.dataObjects[i];    
                
         const listItemData = _renderListItem(dataObj, j, listOpts);
        
         listItemData.dataIndex = i;

         if(visibleItemsAmount-- > 0) {      
            _toggleListItemVisibility(listItemData, true);
         };
            
         tempHTMLDocFrag.appendChild(listItemData.listItemHTML);
      };
      
      listHTMLElement.appendChild(tempHTMLDocFrag);
      listOpts.listWrapper.appendChild(listHTMLElement);
      
      listOpts.listHTMLElement = listHTMLElement;
    };
  
  
    function _renderListItem (dataObj, index, defOpts) {
      
         const listItemData = {
            data: dataObj,
            index: index, // index from overall data items array
            isVisible: false,
            isSelected: defOpts.selectedIndex === index, 
         };
        
         defOpts.listItemsData.push(listItemData);

         const listItem = _createListItemElement(defOpts.listItemTag, LIST_ITEM_IDENTITY_CLASS, listItemData);
      
         /// add additional classes defined by the user
         listItem.classList.add.apply(listItem.classList, defOpts.listItemClasses);
      
         const templateStr = defOpts.onDisplay(listItemData);

         listItem.innerHTML = templateStr || "";
      
         listItemData.listItemHTML = listItem;
      
         defOpts.intersectionObserver.observe(listItem);
      
         return listItemData;
    };
  
  
    function _createListItemElement (listItemTag, listItemClass, listItemData) {      
         const listItem = document.createElement(listItemTag);
         
         listItem.className = listItemClass;

         listItem.setAttribute(LIST_ITEM_VISIBLE_ATTR, listItemData.isVisible);
         listItem.setAttribute(LIST_ITEM_SELECTED_ATTR, listItemData.isSelected);
         listItem.setAttribute(LIST_ITEM_INDEX_ATTR, listItemData.index);

         return listItem;
    };
  
  
    function _toggleListItemVisibility (listItemData, isVisible) {
        const list = this; 
        listItemData.isVisible = isVisible;
        const listItemHTML = listItemData.listItemHTML;
      
        if(isVisible) {
          
         listItemData.visibleIndex = list.visibleItems.length;
         list.visibleItems.push(listItemData);   
          
         if(listItemData.visibleIndex != undefined) // visibleIndex can be 0
          listItemHTML.setAttribute(LIST_ITEM_VISIBLE_INDEX_ATTR, listItemData.visibleIndex);
           
        } else {
          list.visibleItems.splice(listItemData.visibleIndex, 1);
          delete listItemData.visibleIndex;
          listItemHTML.removeAttribute(LIST_ITEM_VISIBLE_INDEX_ATTR);
        }
        
        listItemHTML.setAttribute(LIST_ITEM_VISIBLE_ATTR, listItemData.isVisible);
    };
  
    function _handleListItemsIntersection (entries, observerObj) {
      entries.forEach(function(entry, i) {
        /*TODO: 
        1. Determine when element is gone above the list's upper bound and when it's gone below the list's bottom bound.
        2. Determine when there is more than 2 listItems above the list's upper bound, the third one should be deleted.
        3. Determine when there is only 1 listItem below the list's bottom bound, the next list item should be loaded and appended to the list
        4. Check whether we can/should use rootMargin property of the IntersectionObserver.
        */
        const currentListItem = entry.target;
        if(entry.isIntersecting) {
          debugger;
          if(0 < entry.intersectionRatio && entry.intersectionRatio < 1.0) {
            const listItemIndex = currentListItem.getAttribute("data-index");
            const listItemData = getListItemData(listItemIndex);
            _toggleListItemVisibility(listItemData, true);
          }
        } else {
          debugger;
          const listItemIndex = currentListItem.getAttribute("data-index");
          const listItemData = getListItemData(listItemIndex);
          _toggleListItemVisibility(listItemData, false);
        }  

          
        ///observerObj.unobserve(img); /// instructs the IntersectionObserver to stop observing the specified target element
      });
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




function loadPolyfills () {
  "use strict";
 
  const isIntersectionObserverSupported = "IntersectionObserver" in window;
  
  // If Intersection Observer doesn't supported we apply polyfill for support.
  if(!isIntersectionObserverSupported) {
     intersectionObserverPolyfill();
  };
  
  /// minified version of the Intersection Observer polyfill from: https://github.com/w3c/IntersectionObserver/blob/master/polyfill/intersection-observer.js
  function intersectionObserverPolyfill () {
    (function(window,document){'use strict';if('IntersectionObserver' in window&&'IntersectionObserverEntry' in window&&'intersectionRatio' in window.IntersectionObserverEntry.prototype){if(!('isIntersecting' in window.IntersectionObserverEntry.prototype)){Object.defineProperty(window.IntersectionObserverEntry.prototype,'isIntersecting',{get:function(){return this.intersectionRatio>0}})}
return}
var registry=[];function IntersectionObserverEntry(entry){this.time=entry.time;this.target=entry.target;this.rootBounds=entry.rootBounds;this.boundingClientRect=entry.boundingClientRect;this.intersectionRect=entry.intersectionRect||getEmptyRect();this.isIntersecting=!!entry.intersectionRect;var targetRect=this.boundingClientRect;var targetArea=targetRect.width*targetRect.height;var intersectionRect=this.intersectionRect;var intersectionArea=intersectionRect.width*intersectionRect.height;if(targetArea){this.intersectionRatio=intersectionArea/targetArea}else{this.intersectionRatio=this.isIntersecting?1:0}}
function IntersectionObserver(callback,opt_options){var options=opt_options||{};if(typeof callback!='function'){throw new Error('callback must be a function')}
if(options.root&&options.root.nodeType!=1){throw new Error('root must be an Element')}
this._checkForIntersections=throttle(this._checkForIntersections.bind(this),this.THROTTLE_TIMEOUT);this._callback=callback;this._observationTargets=[];this._queuedEntries=[];this._rootMarginValues=this._parseRootMargin(options.rootMargin);this.thresholds=this._initThresholds(options.threshold);this.root=options.root||null;this.rootMargin=this._rootMarginValues.map(function(margin){return margin.value+margin.unit}).join(' ')}
IntersectionObserver.prototype.THROTTLE_TIMEOUT=100;IntersectionObserver.prototype.POLL_INTERVAL=null;IntersectionObserver.prototype.USE_MUTATION_OBSERVER=!0;IntersectionObserver.prototype.observe=function(target){var isTargetAlreadyObserved=this._observationTargets.some(function(item){return item.element==target});if(isTargetAlreadyObserved){return}
if(!(target&&target.nodeType==1)){throw new Error('target must be an Element')}
this._registerInstance();this._observationTargets.push({element:target,entry:null});this._monitorIntersections();this._checkForIntersections()};IntersectionObserver.prototype.unobserve=function(target){this._observationTargets=this._observationTargets.filter(function(item){return item.element!=target});if(!this._observationTargets.length){this._unmonitorIntersections();this._unregisterInstance()}};IntersectionObserver.prototype.disconnect=function(){this._observationTargets=[];this._unmonitorIntersections();this._unregisterInstance()};IntersectionObserver.prototype.takeRecords=function(){var records=this._queuedEntries.slice();this._queuedEntries=[];return records};IntersectionObserver.prototype._initThresholds=function(opt_threshold){var threshold=opt_threshold||[0];if(!Array.isArray(threshold))threshold=[threshold];return threshold.sort().filter(function(t,i,a){if(typeof t!='number'||isNaN(t)||t<0||t>1){throw new Error('threshold must be a number between 0 and 1 inclusively')}
return t!==a[i-1]})};IntersectionObserver.prototype._parseRootMargin=function(opt_rootMargin){var marginString=opt_rootMargin||'0px';var margins=marginString.split(/\s+/).map(function(margin){var parts=/^(-?\d*\.?\d+)(px|%)$/.exec(margin);if(!parts){throw new Error('rootMargin must be specified in pixels or percent')}
return{value:parseFloat(parts[1]),unit:parts[2]}});margins[1]=margins[1]||margins[0];margins[2]=margins[2]||margins[0];margins[3]=margins[3]||margins[1];return margins};IntersectionObserver.prototype._monitorIntersections=function(){if(!this._monitoringIntersections){this._monitoringIntersections=!0;if(this.POLL_INTERVAL){this._monitoringInterval=setInterval(this._checkForIntersections,this.POLL_INTERVAL)}
else{addEvent(window,'resize',this._checkForIntersections,!0);addEvent(document,'scroll',this._checkForIntersections,!0);if(this.USE_MUTATION_OBSERVER&&'MutationObserver' in window){this._domObserver=new MutationObserver(this._checkForIntersections);this._domObserver.observe(document,{attributes:!0,childList:!0,characterData:!0,subtree:!0})}}}};IntersectionObserver.prototype._unmonitorIntersections=function(){if(this._monitoringIntersections){this._monitoringIntersections=!1;clearInterval(this._monitoringInterval);this._monitoringInterval=null;removeEvent(window,'resize',this._checkForIntersections,!0);removeEvent(document,'scroll',this._checkForIntersections,!0);if(this._domObserver){this._domObserver.disconnect();this._domObserver=null}}};IntersectionObserver.prototype._checkForIntersections=function(){var rootIsInDom=this._rootIsInDom();var rootRect=rootIsInDom?this._getRootRect():getEmptyRect();this._observationTargets.forEach(function(item){var target=item.element;var targetRect=getBoundingClientRect(target);var rootContainsTarget=this._rootContainsTarget(target);var oldEntry=item.entry;var intersectionRect=rootIsInDom&&rootContainsTarget&&this._computeTargetAndRootIntersection(target,rootRect);var newEntry=item.entry=new IntersectionObserverEntry({time:now(),target:target,boundingClientRect:targetRect,rootBounds:rootRect,intersectionRect:intersectionRect});if(!oldEntry){this._queuedEntries.push(newEntry)}else if(rootIsInDom&&rootContainsTarget){if(this._hasCrossedThreshold(oldEntry,newEntry)){this._queuedEntries.push(newEntry)}}else{if(oldEntry&&oldEntry.isIntersecting){this._queuedEntries.push(newEntry)}}},this);if(this._queuedEntries.length){this._callback(this.takeRecords(),this)}};IntersectionObserver.prototype._computeTargetAndRootIntersection=function(target,rootRect){if(window.getComputedStyle(target).display=='none')return;var targetRect=getBoundingClientRect(target);var intersectionRect=targetRect;var parent=getParentNode(target);var atRoot=!1;while(!atRoot){var parentRect=null;var parentComputedStyle=parent.nodeType==1?window.getComputedStyle(parent):{};if(parentComputedStyle.display=='none')return;if(parent==this.root||parent==document){atRoot=!0;parentRect=rootRect}else{if(parent!=document.body&&parent!=document.documentElement&&parentComputedStyle.overflow!='visible'){parentRect=getBoundingClientRect(parent)}}
if(parentRect){intersectionRect=computeRectIntersection(parentRect,intersectionRect);if(!intersectionRect)break}
parent=getParentNode(parent)}
return intersectionRect};IntersectionObserver.prototype._getRootRect=function(){var rootRect;if(this.root){rootRect=getBoundingClientRect(this.root)}else{var html=document.documentElement;var body=document.body;rootRect={top:0,left:0,right:html.clientWidth||body.clientWidth,width:html.clientWidth||body.clientWidth,bottom:html.clientHeight||body.clientHeight,height:html.clientHeight||body.clientHeight}}
return this._expandRectByRootMargin(rootRect)};IntersectionObserver.prototype._expandRectByRootMargin=function(rect){var margins=this._rootMarginValues.map(function(margin,i){return margin.unit=='px'?margin.value:margin.value*(i%2?rect.width:rect.height)/100});var newRect={top:rect.top-margins[0],right:rect.right+margins[1],bottom:rect.bottom+margins[2],left:rect.left-margins[3]};newRect.width=newRect.right-newRect.left;newRect.height=newRect.bottom-newRect.top;return newRect};IntersectionObserver.prototype._hasCrossedThreshold=function(oldEntry,newEntry){var oldRatio=oldEntry&&oldEntry.isIntersecting?oldEntry.intersectionRatio||0:-1;var newRatio=newEntry.isIntersecting?newEntry.intersectionRatio||0:-1;if(oldRatio===newRatio)return;for(var i=0;i<this.thresholds.length;i++){var threshold=this.thresholds[i];if(threshold==oldRatio||threshold==newRatio||threshold<oldRatio!==threshold<newRatio){return!0}}};IntersectionObserver.prototype._rootIsInDom=function(){return!this.root||containsDeep(document,this.root)};IntersectionObserver.prototype._rootContainsTarget=function(target){return containsDeep(this.root||document,target)};IntersectionObserver.prototype._registerInstance=function(){if(registry.indexOf(this)<0){registry.push(this)}};IntersectionObserver.prototype._unregisterInstance=function(){var index=registry.indexOf(this);if(index!=-1)registry.splice(index,1)};function now(){return window.performance&&performance.now&&performance.now()}
function throttle(fn,timeout){var timer=null;return function(){if(!timer){timer=setTimeout(function(){fn();timer=null},timeout)}}}
function addEvent(node,event,fn,opt_useCapture){if(typeof node.addEventListener=='function'){node.addEventListener(event,fn,opt_useCapture||!1)}
else if(typeof node.attachEvent=='function'){node.attachEvent('on'+event,fn)}}
function removeEvent(node,event,fn,opt_useCapture){if(typeof node.removeEventListener=='function'){node.removeEventListener(event,fn,opt_useCapture||!1)}
else if(typeof node.detatchEvent=='function'){node.detatchEvent('on'+event,fn)}}
function computeRectIntersection(rect1,rect2){var top=Math.max(rect1.top,rect2.top);var bottom=Math.min(rect1.bottom,rect2.bottom);var left=Math.max(rect1.left,rect2.left);var right=Math.min(rect1.right,rect2.right);var width=right-left;var height=bottom-top;return(width>=0&&height>=0)&&{top:top,bottom:bottom,left:left,right:right,width:width,height:height}}
function getBoundingClientRect(el){var rect;try{rect=el.getBoundingClientRect()}catch(err){}
if(!rect)return getEmptyRect();if(!(rect.width&&rect.height)){rect={top:rect.top,right:rect.right,bottom:rect.bottom,left:rect.left,width:rect.right-rect.left,height:rect.bottom-rect.top}}
return rect}
function getEmptyRect(){return{top:0,bottom:0,left:0,right:0,width:0,height:0}}
function containsDeep(parent,child){var node=child;while(node){if(node==parent)return!0;node=getParentNode(node)}
return!1}
function getParentNode(node){var parent=node.parentNode;if(parent&&parent.nodeType==11&&parent.host){return parent.host}
return parent}
window.IntersectionObserver=IntersectionObserver;window.IntersectionObserverEntry=IntersectionObserverEntry}(window,document))
  };
  
};
