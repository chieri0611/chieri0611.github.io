/* **********************************************************************
* 
*  Name: common.js
*
*  Description: Common Javascript
*  Author: chieri0611
*  Create: 2022/02/11
*  Update: 2022/07/17
*
********************************************************************** */


/* ======================================================================
*
*  Polyfill
*
*  Menu
*    [-] loadMenuButton
*
*  Dialog
*    [-] showDialog
*    [-] closeDialog
*    [-] visibleDialog
*    [-] hiddenDialog
*    [-] showListDialog
*    [-] closeListDialog
*    [-] showProgressDialog
*    [-] setProgressValue
*    [-] closeProgressDialog
*
*  Paging
*    [-] initPaging
*    [-] updatePaging
*
*  Array
*    [-] sumArray
*    [-] choose
*    [-] fillObject
*
*  Element
*    [-] hasClass
*    [-] isElement
*    [-] removeElement
*    [-] removeChildElements
*    [-] toggleClass
*    [-] toggleDisable
*    [-] getRadioValue
*    [-] initSpinBox
*    [-] replaceCheckBox
*    [-] initAllCheckBox
*    [-] allChecked
*    [-] getCheckedValues
*    [-] setLongPressEvent
*
*  Object
*    [-] cloneObject
*    [-] setMatrixObject
*    [-] sortMatrixObject
*
*  JSON
*    [-] compressJSON
*    [-] decompressJSON
*
*  File
*    [-] loadAllFiles
*
*  Decimal Number
*
*  Others
*    [-] getURLQueryParam
*    [-] replaceURLQueryParam
*  
====================================================================== */



/* ----------------------------------------------------------------------
*  Polyfill
---------------------------------------------------------------------- */
Number.isInteger = Number.isInteger || function(value) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

if(!Math.sign) {
  Math.sign = function(num) { return ((num > 0) - (num < 0)) || +num; }
}

if(!Object.values) { Object.values = function(obj) {
  return Object.keys(obj).map(function(key) { return obj[key]; });
}}

if(!Object.entries) { Object.entries = function(obj) {
  return Object.keys(obj).map(function(key) { return [key, obj[key]]; });
}}

if(typeof Object.assign !== 'function') {
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) {
      'use strict';
      if(target === null || target === undefined) throw new TypeError('Cannot convert undefined or null to object');
      var to = Object(target);
      for(var i = 1; i < arguments.length; i++) {
        var nextsrc = arguments[i];
        if(nextsrc === null || nextsrc === undefined) continue;
        for(var nextkey in nextsrc) {
          if(Object.prototype.hasOwnProperty.call(nextsrc, nextkey)) to[nextkey] = nextsrc[nextkey];
        }
      }
      return to;
    },
    writable: true, configurable: true
  });
}

if(!Array.prototype.fill) {
  Object.defineProperty(Array.prototype, 'fill', {
    value: function(value) {
      if(this == null) throw new TypeError('this is null or not defined');

      var o = Object(this), len = o.length >>> 0;
      var start = arguments[1], relStart = start >> 0;
      var i = relStart < 0 ? Math.max(len + relStart, 0) : Math.min(relStart, len);
      var end = arguments[2];
      var relEnd = end === undefined ? len : end >> 0;
      var final = relEnd < 0 ? Math.max(len + relEnd, 0) : Math.min(relEnd, len);

      while(i < final) { o[i] = value; i++; }
      return o;
    }
  });
}

if(!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
      if(this == null) throw TypeError('this is null or not defined');

      var o = Object(this), len = o.length >>> 0;
      if(typeof predicate !== 'function') throw TypeError('predicate must be a function');
      var thisArg = arguments[1], i = 0;

      while (i < len) {
        var kValue = o[i]; if(predicate.call(thisArg, kValue, i, o)) return kValue;
        i++;
      }
      return;
    },
    configurable: true,
    writable: true
  });
}

if(!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function(predicate) {
      if(this == null) throw TypeError('this is null or not defined');

      var o = Object(this), len = o.length >>> 0;
      if(typeof predicate !== 'function') throw TypeError('predicate must be a function');
      var thisArg = arguments[1], i = 0;

      while (i < len) {
        var kValue = o[i]; if(predicate.call(thisArg, kValue, i, o)) return i;
        i++;
      }
      return -1;
    },
    configurable: true,
    writable: true
  });
}

if(!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    'use_strict';
    if(this == null) throw new TypeError('can\'t convert ' + this + ' to object');
    var str = '' + this;
    count = +count; if(count != count) count = 0;
    if(count < 0) throw new RangeError('repert count must be non-negative');
    if(count == Infinity) throw new RangeError('repert count must be less than infinity');
    count = Math.floor(count);
    if(str.length == 0 || count == 0) return '';
    if(str.length * count >= 1 << 28) throw new RangeError('repert count must not overflow maximum string size');
    var maxCount = str.length * count;
    count = Math.floor(Math.log(count) / Math.log(2));
    while(count) { str += str; count--; }
    str += str.substring(0, maxCount - str.length);
    return str;
  }
}



/* ----------------------------------------------------------------------
*  Menu
---------------------------------------------------------------------- */

/* loadMenuButton
====================================================================== */
function loadMenuButton(id) {
  var menuelem = document.getElementById("menu");
  menuelem.className = "menu_container";
  menuelem.innerHTML = "";

  const rootdir = location.hostname == 'localhost' ? '/Github' : '';

  try {

  var urlquery= getURLQueryParam();
  var nocache = urlquery.hasOwnProperty('cache') ? urlquery.cache == '0' : false;

  var xhr = new XMLHttpRequest();
  xhr.open('GET', rootdir + "/menu.json", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  if(nocache) {
    xhr.setRequestHeader('Pragma', 'no-cache');
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');
  }

  function errorMenu(errtext) {
    var errelem = document.createElement('div');
    errelem.textContent = errtext;
    menuelem.appendChild(errelem); menuelem.className = "menu_container noscript";
  }

  xhr.onreadystatechange = function() {
    if(xhr.readyState != 4) return;
    if(xhr.responseText != '') {
      var menu = JSON.parse(xhr.responseText);
      menu = menu.content.find(function(element) { return element.id == id; });
      if(!menu) { errorMenu("Coming Soon..."); return; }

      var fragelem = document.createDocumentFragment();
      menu.menu.map(function(element) {
        var btnelem = document.createElement('a');
        btnelem.className = "menu_button"; btnelem.id = element.id;
        var btnhref = element.ref;
        if(btnhref.slice(0,1) == '/') btnhref = rootdir + btnhref;
        btnelem.href = btnhref.replace(/\r?\n/g, '&#010;');
        if(!element.enable) btnelem.setAttribute("disabled", "disabled");
        if(element.icon != '') {
          var imgelem = document.createElement('img');
          var imgowner = document.createElement('div');
          var btnicon = element.icon;
          if(btnicon.slice(0,1) == '/') btnicon = rootdir + btnicon;
          imgelem.src = btnicon;
          imgowner.appendChild(imgelem); btnelem.appendChild(imgowner);
        }
        btnelem.appendChild(document.createTextNode(element.title));
        fragelem.appendChild(btnelem);
      });
      if(fragelem.childElementCount == 0) { errorMenu("Coming Soon..."); return; }
      menuelem.appendChild(fragelem);

            
    } else {
       errorMenu("メニューの読み込みに失敗しました");
    }
  }
  xhr.send();

  } catch(e) {
    errorMenu("メニューの読み込みに失敗しました");
  }
}



/* ----------------------------------------------------------------------
*  Dialog
---------------------------------------------------------------------- */

/* showDialog
====================================================================== */
function showDialog(content, title, id, btntext, btntype, btnevent, modal, closebutton) {
  const close_event = "closeDialog('" + id + "')";

  var overlay = document.createElement('div');
  overlay.className = "overlay";
  if(modal !== true) overlay.setAttribute("onclick", close_event);

  var dialog = document.createElement('div'); dialog.id = id;
  dialog.className = "dialog hidden";
  dialog.addEventListener('click', function(e) { e.stopPropagation(); });

  if(title) {
    var head_elem = document.createElement('header');
    var title_elem = document.createElement('div');
    title_elem.className = "title";
    if(isElement(title)) {
      title_elem.appendChild(title);
    } else {
      title_elem.textContent = title;
    }
    head_elem.appendChild(title_elem); dialog.appendChild(head_elem);
  }

  var cont_elem = document.createElement('div');
  if(isElement(content)) {
    cont_elem.className = "dialog_content";
    cont_elem.appendChild(content);
  } else {
    cont_elem.className = "dialog_content prompt";
    var prompt_elem = document.createElement('div');
    prompt_elem.className = "dialog_prompt"; prompt_elem.innerHTML = String(content);
    cont_elem.appendChild(prompt_elem);
  }
  dialog.appendChild(cont_elem);

  var foot_elem = document.createElement('footer');
  if(btntext == null) btntext = "閉じる";
  if(btntype == null) btntype = 0;
  if(btnevent == null) btnevent = close_event;
  if(!Array.isArray(btntext)) btntext = [btntext];
  if(!Array.isArray(btntype)) btntype = [btntype];
  if(!Array.isArray(btnevent)) btnevent = [btnevent];
  btntext.map(function(element, idx) {
    var btnelem = document.createElement('button');
    btnelem.textContent = String(element);
    if(btntype.length > idx) {
      switch(btntype[idx]) {
      case 1: btnelem.className = "exec_button"; break;
      case 2: btnelem.className = "cancel_button"; break;
      }
    }
    if(btnevent.length > idx) {
      if(typeof btnevent[idx] == 'function') {
        btnelem.addEventListener('click', function(e) { btnevent[idx](); });
      } else if(typeof btnevent[idx] == 'string') {
        btnelem.setAttribute("onclick", String(btnevent[idx]));
      } else {
        btnelem.setAttribute("onclick", close_event);
      }
    } else {
      btnelem.setAttribute("onclick", close_event);
    }
    foot_elem.appendChild(btnelem);
  });
  dialog.appendChild(foot_elem);

  if(closebutton == true) {
    var close_btn = document.createElement('button');
    close_btn.className = "dialog_close";
    close_btn.setAttribute("onclick", close_event); dialog.appendChild(close_btn);
  }

  overlay.appendChild(dialog);
  overlay = document.body.appendChild(overlay);
  dialog = overlay.querySelector('.dialog.hidden'); 
  setTimeout(function showdlg() { dialog.className = "dialog"; }, 20);
}


/* closeDialog
====================================================================== */
function closeDialog(dlgid) {
  var dialog = document.getElementById(dlgid);
  if(dialog == null) return;

  var overlay = dialog.parentNode;
  dialog.className = "dialog hidden";
  setTimeout(function closedlg() { document.body.removeChild(overlay); }, 100);
}


/* visibleDialog
====================================================================== */
function visibleDialog(dlgid) {
  var dialog = document.getElementById(dlgid);
  if(dialog == null) return;

  var overlay = dialog.parentNode; overlay.className = "overlay";
  setTimeout(function showdlg() { dialog.className = "dialog"; }, 20);
}


/* hiddenDialog
====================================================================== */
function hiddenDialog(dlgid) {
  var dialog = document.getElementById(dlgid);
  if(dialog == null) return;

  var overlay = dialog.parentNode;
  dialog.className = "dialog hidden";
  setTimeout(function closedlg() { overlay.className = "overlay hidden"; }, 100);
}


/* showListDialog
====================================================================== */
function showListDialog(obj) {
  if(obj.className != "listbox_frame") return;
  obj = obj.getElementsByTagName("select");
  if(obj.length != 1) return;
  obj = obj[0]; if(obj.id == "") return;
  var listitems = obj.children;

  var cnt = 0, listelem = document.createDocumentFragment();
  for(var i = 0; i < listitems.length; i++) {
    if(listitems[i].tagName.toLowerCase() != "option") continue;

    cnt++;
    var listitem = document.createElement('div');
    listitem.className = "listitem";

    var radio_elem = document.createElement('input');
    radio_elem.type = "radio"; radio_elem.name = "listitem";
    radio_elem.id = "listitem_" + cnt; radio_elem.value = String(cnt);
    if(listitems[i].selected) radio_elem.checked = true;

    var label_elem = document.createElement('label');
    label_elem.htmlFor = "listitem_" + cnt;
    label_elem.textContent = listitems[i].textContent;

    listitem.appendChild(radio_elem); listitem.appendChild(label_elem);
    listelem.appendChild(listitem);
  }

  showDialog(listelem, null, "list_dialog", "決定", 1, "closeListDialog('" + obj.id + "')", true);
  obj.blur();
}


/* closeListDialog
====================================================================== */
function closeListDialog(id) {
  var listelem = document.getElementById(id);
  if(listelem == null) return;
  var listitems = document.getElementById("list_dialog");
  if(listitems == null) return;
  listitems = listitems.getElementsByClassName("listitem");

  for(var i = 0; i < listitems.length; i++) {
    var radio_elem = listitems[i].getElementsByTagName("input")[0];
    if(radio_elem.name != "listitem") continue;
    if(!radio_elem.checked) continue;
    listelem.selectedIndex = Number(radio_elem.value) - 1; break;
  }
  closeDialog("list_dialog");
}


/* showProgressDialog
====================================================================== */
function showProgressDialog(title, description, cancelbutton, cancelevent) {
  if(document.getElementById("loadwindow") != null) return;

  var dialog = document.createElement('div');
  dialog.className = "loadwindow hidden"; dialog.id = "loadwindow";

  var title_elem = document.createElement('div'); title_elem.className = "title";
  if(title != null) title_elem.textContent = String(title);
  dialog.appendChild(title_elem);

  var prog_elem = document.createElement('div'); prog_elem.className = "progress";
  var prog_frame = document.createElement('div'); prog_frame.className = "progress_frame";
  var prog_bar = document.createElement('div'); prog_bar.className = "progress_bar";
  prog_bar.id = "progress_bar"; prog_bar.style = "width: 0%";
  prog_frame.appendChild(prog_bar); prog_elem.appendChild(prog_frame);
  dialog.appendChild(prog_elem);

  var desc_elem = document.createElement('div'); desc_elem.className = "description";
  if(description != null) desc_elem.textContent = String(description);
  dialog.appendChild(desc_elem);

  if(cancelbutton != null) {
    var foot_elem = document.createElement('footer');
    var btnelem = document.createElement('button');
    btnelem.className = "cancel_button";
    btnelem.textContent = String(cancelbutton);
    btnelem.setAttribute("onclick", cancelevent != null ? String(cancelevent) : "closeProgressDialog()");
    foot_elem.appendChild(btnelem); dialog.appendChild(foot_elem);
  }

  var overlay = document.createElement('div'); overlay.className = "overlay loading";

  overlay.appendChild(dialog);
  overlay = document.body.appendChild(overlay);
  dialog = overlay.querySelector('.loadwindow.hidden'); 
  setTimeout(function showdlg() { dialog.className = "loadwindow"; }, 20);
}


/* setProgressValue
====================================================================== */
function setProgressValue(prog_value, title, description) {
  var dialog = document.getElementById("loadwindow");
  if(dialog == null) return;

  var prog_bar = document.getElementById("progress_bar");
  prog_bar.style = "width: " + prog_value + "%";

  if(title != null) {
    var title_elem = dialog.querySelector(".title");
    title_elem.textContent = String(title);
  }
  if(description != null) {
    var desc_elem = dialog.querySelector(".description");
    desc_elem.textContent = String(description);
  }
}


/* closeProgressDialog
====================================================================== */
function closeProgressDialog() {
  var dialog = document.getElementById("loadwindow");
  if(dialog == null) return;

  var overlay = dialog.parentNode; 
  dialog.className = "loadwindow hidden";
  setTimeout(function closedlg() { document.body.removeChild(overlay); }, 100)  
}



/* ----------------------------------------------------------------------
*  Paging
---------------------------------------------------------------------- */

/* initPaging
====================================================================== */
function initPaging(obj) {
  var pagemain = obj.querySelector(".paging_main");
  var pageleft = obj.querySelector(".paging_left");
  var pageright = obj.querySelector(".paging_right");

  pageleft.addEventListener('click', function(e) {
    pagemain.scrollLeft = pagemain.scrollLeft - pagemain.clientWidth;
  });

  pageright.addEventListener('click', function(e) {
    pagemain.scrollLeft = pagemain.scrollLeft + pagemain.clientWidth;
  });

  updatePaging(obj, 1, null);
}

/* updatePaging
====================================================================== */
function updatePaging(obj, maxpage, change_func) {
  var pagemain = obj.querySelector(".paging_container");
  pagemain.innerHTML = '';
  var listelem = document.createDocumentFragment();
  maxpage = Math.max(Math.ceil(maxpage), 1);

  for(var i = 1; i <= maxpage; i++) {
    var pagebtn = document.createElement('button');
    pagebtn.className = i == 1 ? "paging_button select" : "paging_button";
    pagebtn.dataset.page = i; pagebtn.textContent = i;

    pagebtn.addEventListener('click', function(e) {
      pagemain.querySelector(".paging_button.select").className = "paging_button";
      var pagenum = parseFloat(this.dataset.page);
      this.className = "paging_button select";
      change_func(pagenum);
    });

    listelem.appendChild(pagebtn);
  }
  pagemain.scrollLeft = 0;
  pagemain.appendChild(listelem);
}



/* ----------------------------------------------------------------------
*  Array
---------------------------------------------------------------------- */

/* sumArray
====================================================================== */
function sumArray(ary) {
  if((!Array.isArray(ary)) || ary.length === 0) return;
  var i = ary.length, sumval = 0;
  while(i--) { sumval += ary[i]; }
  return sumval;
}

/* choose
====================================================================== */
function choose(index_num, value1) {
  if(typeof index_num !== 'number') return;
  if(!Number.isInteger(index_num)) return;
  if(index_num < 1) return;
  if(index_num > (arguments.length - 1)) return;
  return arguments[index_num];
}

/* fillObject
====================================================================== */
function fillObject(ary, obj) {
  ary.fill(null); return ary.map(function(elem) { return cloneObject(obj); });
}



/* ----------------------------------------------------------------------
*  Element
---------------------------------------------------------------------- */

/* hasClass
====================================================================== */
function hasClass(obj, cls) {
  var clslist = obj.className.split(" ");
  var clsindex = clslist.indexOf(cls);
  return (clsindex != -1);
}

/* isElement
====================================================================== */
function isElement(obj) {
  try {
    return (obj instanceof HTMLElement || obj instanceof DocumentFragment);
  } catch(e) {
    return obj.nodeName && (obj.nodeType == 1 || obj.nodeType == 11) && typeof obj === "object"
  }
}

/* removeElement
====================================================================== */
function removeElement(obj) { obj.parentNode.removeChild(obj); }

/* removeChildElements
====================================================================== */
function removeChildElements(obj) { while(obj.firstChild) obj.removeChild(obj.firstChild); }

/* toggleClass
====================================================================== */
function toggleClass(obj, cls, state) {
  var clslist = obj.className.split(" ");
  var clsindex = clslist.indexOf(cls);

  if(typeof state !== "boolean") {
    state = clsindex != -1 ? false : true;
  }

  if(state) {
    if(clsindex != -1) { return true; }
    clslist.push(cls);
  } else {
    if(clsindex == -1) { return false; }
    clslist.splice(clsindex, 1);
  }

  var joincls = clslist.join(" ");
  obj.className = joincls;
  return state;
}

/* toggleDisable
====================================================================== */
function toggleDisable(obj, state) {
  if(typeof state !== "boolean") {
    state = obj.hasAttribute("disabled") ? false : true;
  }
  if(state) {
    obj.setAttribute("disabled", "disabled");
  } else {
    obj.removeAttribute("disabled");
  }
  return state;
}

/* getRadioValue
====================================================================== */
function getRadioValue(name) {
  var radios = document.getElementsByName(name);
  for(var i = 0; i < radios.length; i++) {
    if(radios[i].checked) {
      if(!radios[i].hasAttribute("value")) return "";
      return radios[i].value;
    }
  }
  return "";
}

/* initSpinBox
====================================================================== */
function initSpinBox(inputbox, spinup, spindown) {
  const spin_interval = 50, spin_delay = 500;
  var e_spintimer = 0;

  if(!isElement(inputbox)) throw new TypeError("'inputbox' is not a Element");
  if(!isElement(spinup)) throw new TypeError("'spinup' is not a Element");
  if(!isElement(spindown)) throw new TypeError("'spindown' is not a Element");

  function spin_valueUpdate(input, upbtn, downbtn, increment) {
    var spinvalue = parseFloat(input.value); if(isNaN(spinvalue)) spinvalue = 1;
    var spinmin = parseFloat(input.min), spinmax = parseFloat(input.max);
    var spinstep = !isNaN(parseFloat(input.step)) ? parseFloat(input.step) : 1;

    spinvalue += increment ? spinstep : -spinstep;

    if(!isNaN(spinmin) && spinvalue < spinmin) input.value = spinmin;
    else if(!isNaN(spinmax) && spinvalue > spinmax) input.value = spinmax;
    else input.value = spinvalue;
    e_valuechange(input, upbtn, downbtn);
    if(spinvalue == (increment ? spinmax : spinmin)) e_spinend();
    input.onchange();
  }

  function e_valuechange(input, upbtn, downbtn) {
    var spinvalue = parseFloat(input.value); if(isNaN(spinvalue)) spinvalue = 1;
    var spinmin = parseFloat(input.min), spinmax = parseFloat(input.max);
    upbtn.disabled = !isNaN(spinmax) && spinvalue >= spinmax;
    downbtn.disabled = !isNaN(spinmin) && spinvalue <= spinmin;
  }

  function e_spinclick(input, upbtn, downbtn, increment) {
    if(e_spintimer == 0) spin_valueUpdate(input, upbtn, downbtn, increment);
  }

  function e_spinstart(input, upbtn, downbtn, increment) {
    if(e_spintimer != 0) return;
    var spin_start = new Date().getTime();
    e_spintimer = setInterval(function() {
      if(new Date().getTime() - spin_start <= spin_delay) return;
      spin_valueUpdate(input, upbtn, downbtn, increment);
    }, spin_interval);
  }

  function e_spinend() {
    if(e_spintimer == 0) return;
    clearInterval(e_spintimer); e_spintimer = 0;
  }

  //inputbox.addEventListener('change', function(e) { e_valuechange(inputbox, spinup, spindown); });

  spinup.addEventListener('click', function(e) { e_spinclick(inputbox, spinup, spindown, true); });
  spinup.addEventListener('mousedown', function(e) { e_spinstart(inputbox, spinup, spindown, true); });
  spinup.addEventListener('touchstart', function(e) { e_spinstart(inputbox, spinup, spindown, true); });
  spinup.addEventListener('mouseup', function(e) { e_spinend(); });
  spinup.addEventListener('touchend', function(e) { e_spinend(); });

  spindown.addEventListener('click', function(e) { e_spinclick(inputbox, spinup, spindown, false); });
  spindown.addEventListener('mousedown', function(e) { e_spinstart(inputbox, spinup, spindown, false); });
  spindown.addEventListener('touchstart', function(e) { e_spinstart(inputbox, spinup, spindown, false); });
  spindown.addEventListener('mouseup', function(e) { e_spinend(); });
  spindown.addEventListener('touchend', function(e) { e_spinend(); });

  e_valuechange(inputbox, spinup, spindown);
}


/* replaceCheckBox
====================================================================== */
function replaceCheckBox(groupname) {
  var checkelems = document.getElementsByName(groupname);
  for(var i = 0; i < checkelems.length; i++) {
    var elem = checkelems[i];
    if(elem.parentNode.className == "checkbox" || elem.type != "checkbox") continue;
    if(elem.id == null) continue;
    const lbltext = elem.hasAttribute('data-caption') ? elem.dataset.caption : '';
    const elemval = elem.hasAttribute('value') ? elem.value : '';
    elem.outerHTML =
      '<div class="checkbox">' +
        '<input type="checkbox" name="'+ elem.name + '" value="' + elemval + '" id="' + elem.id + '" />' +
        '<label for="' + elem.id + '">' + lbltext + '</label>'
      '</div>';
  }
}


/* initAllCheckBox
====================================================================== */
function initAllCheckBox(groupname) {
  function e_allcheck(groupname, state) {
    var elemlist = document.getElementsByName(groupname);
    for(var i = 0; i < elemlist.length; i++) {
      if(elemlist[i].value != 'all') elemlist[i].checked = state;
    };
  }

  function e_refresh(groupname) {
    var state = true, elemlist = document.getElementsByName(groupname);
    var checkall;
    for(var i = 0; i < elemlist.length; i++) {
      if(elemlist[i].value != 'all') {
        state = elemlist[i].checked && state;
      } else {
        checkall = elemlist[i];
      }
    };
    if(checkall) checkall.checked = state;
  }

  var checkelems = document.getElementsByName(groupname);
  for(var i = 0; i < checkelems.length; i++) {
    if(checkelems[i].value == 'all') {
      checkelems[i].addEventListener('change', function(e) { e_allcheck(this.name, this.checked); });
    } else {
      checkelems[i].addEventListener('change', function(e) { e_refresh(this.name); });
    }
  }
}

/* allChecked
====================================================================== */
function allChecked(groupname, state) {
  var elemlist = document.getElementsByName(groupname);
  for(var i = 0; i < elemlist.length; i++) { elemlist[i].checked = state; };
}

/* getCheckedValues
====================================================================== */
function getCheckedValues(groupname) {
  var checkval = [];
  var elemlist = document.getElementsByName(groupname);
  for(var i = 0; i < elemlist.length; i++) {
    if(elemlist[i].checked) checkval.push(elemlist[i].value);
  };
  return checkval;
}

/* setLongPressEvent
====================================================================== */
function setLongPressEvent(elem, sec, longpress_event) {
  const ua = navigator.userAgent.toLowerCase();
  const is_sp = /iphone|ipod|ipad|android/.test(ua);
  const eLeave = is_sp ?'touchmove' : 'mouseleave';
  var e_presselem, e_presstimer = 0, count_sec = 0;

  if(!isElement(elem)) throw new TypeError("'elem' is not a Element");

  function e_press(e) {
    e.preventDefault(); if(e_presstimer != 0) return;
    count_sec = 0; e_presselem = elem;
    e_presstimer = setInterval(function() {
      count_sec += 10;
      if(sec <= count_sec) {
        clearInterval(e_presstimer); e_presstimer = 0; count_sec = 0; 
        longpress_event.call(e_presselem); e_presselem = undefined;
      }
    }, 10);
  }

  function e_pressend(e) {
    e.preventDefault();
    if(e_presstimer != 0) clearInterval(e_presstimer);
    count_sec = 0; e_presselem = undefined; e_presstimer = 0;
  }

  function e_leave(e) {
    e.preventDefault();
    var el = is_sp ? document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY): e_presselem;
    if(!is_sp || el !== e_presselem) {
      if(e_presstimer != 0) clearInterval(e_presstimer);
      count_sec = 0; e_presselem = undefined; e_presstimer = 0;
    }
  }

  elem.addEventListener('mousedown', function(e) { e_press(e); });
  elem.addEventListener('touchstart', function(e) { e_press(e); });
  elem.addEventListener('mouseup', function(e) { e_pressend(e); });
  elem.addEventListener('touchend', function(e) { e_pressend(e); });
  elem.addEventListener('mouseleave', function(e) { e_leave(e); });
  elem.addEventListener('touchmove', function(e) { e_leave(e); });
}



/* ----------------------------------------------------------------------
*  Object
---------------------------------------------------------------------- */

/* cloneObject
===================================================================== */
function cloneObject(obj) { return JSON.parse(JSON.stringify(obj)); }

/* setMatrixObject
===================================================================== */
function setMatrixObject(obj, criteria_row, criteria_column) {
  if(!Array.isArray(obj) || !Array.isArray(criteria_row)) return;

  var mtrxobj = new Array(criteria_row.length);

  if(Array.isArray(criteria_row[0])) {
    for(var i = 0; i < mtrxobj.length; i++) { mtrxobj[i] = fillObject(new Array(criteria_row[0].length), []); }

    obj.forEach(function(elem) {
      for(var r = 0; r < criteria_row.length; r++) {
        for(var c = 0; c < criteria_row[r].length; c++) {
          var matchflag = true, criteria_data = criteria_row[r][c];
          for(var prop in criteria_data) {
            if(!elem.hasOwnProperty(prop)) { matchflag = false; break; }
            if(elem[prop] != criteria_data[prop]) { matchflag = false; break; }
          }
          if(matchflag) mtrxobj[r][c].push(cloneObject(elem));
        }
      }
    });

  } else {
    if(!Array.isArray(criteria_column)) return;
    for(var i = 0; i < mtrxobj.length; i++) { mtrxobj[i] = fillObject(new Array(criteria_column.length), []); }

    obj.forEach(function(elem) {
      criteria_row.forEach(function(rowelem, r) {
        var matchflag = true;
        for(var prop in rowelem) {
          if(!elem.hasOwnProperty(prop)) { matchflag = false; break; }
          if(elem[prop] != rowelem[prop]) { matchflag = false; break; }
        }
        if(!matchflag) return;

        criteria_column.forEach(function(colelem, c) {
          matchflag = true;
          for(var prop in colelem) {
            if(!elem.hasOwnProperty(prop)) { matchflag = false; break; }
            if(elem[prop] != colelem[prop]) { matchflag = false; break; }
          }
          if(matchflag) mtrxobj[r][c].push(cloneObject(elem));
        });
      });
    });
  }
  return mtrxobj;
}

/* sortMatrixObject
===================================================================== */
function sortMatrixObject() {
}



/* ----------------------------------------------------------------------
*  JSON
---------------------------------------------------------------------- */

/* compressJSON
===================================================================== */

/* decompressJSON
===================================================================== */



/* ----------------------------------------------------------------------
*  File
---------------------------------------------------------------------- */

/* loadAllFiles
===================================================================== */
function loadAllFiles(files, nocache, success_func) {
  var reqs = files.map(function(path, idx) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if(this.readyState != 4) return;
      if(this.status != 200) throw new Error('failed to load file: ' + path + ' (status: ' + this.status + ')');
      var notend = reqs.filter(function(v) { return v.status != 200 || v.readyState != 4; });
      if(!notend.length) success_func(reqs.map(function(v) { return v.responseText; }));
    };
    xhr.open("GET", path);
    if(nocache) {
      xhr.setRequestHeader('Pragma', 'no-cache');
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');
    }
    xhr.send(); return xhr;
  });
}



/* ----------------------------------------------------------------------
*  Decimal Number
---------------------------------------------------------------------- */
var Decimal = (function() {
  function _degits(num1) {
    var numstr = String(num1), degits = numstr.indexOf('.');
    return degits == -1 ? 0 : numstr.length - degits - 1;
  }

  function _bignum(num1, degnum) { return Math.round(num1 * Math.pow(10, degnum)); }

  function _mininum(num1, degnum) {
    if(degnum == 0) return num1;
    var isminus = Math.sign(num1) == -1 ? '-' : '';
    var numstr1 = String(Math.abs(num1));
    if(numstr1.length < degnum) numstr1 = Array(degnum - numstr1.length + 1).join('0') + numstr1;
    var numstr2 = numstr1.slice(degnum * -1);
    numstr1 = numstr1.slice(0, (degnum * -1));
    return Number(isminus + numstr1 + '.' + numstr2);
  }

  function _plus(num1, num2) {
    if(typeof num1 !== 'number' || typeof num2 !== 'number') return NaN;
    var degits = Math.max(_degits(num1), _degits(num2));
    num1 = _bignum(num1, degits), num2 = _bignum(num2, degits);
    num1 = num1 + num2; return _mininum(num1, degits);
  }

  function _minus(num1, num2) {
    if(typeof num1 !== 'number' || typeof num2 !== 'number') return NaN;
    var degits = Math.max(_degits(num1), _degits(num2));
    num1 = _bignum(num1, degits), num2 = _bignum(num2, degits);
    num1 = num1 - num2; return _mininum(num1, degits);
  }

  function _multiply(num1, num2) {
    if(typeof num1 !== 'number' || typeof num2 !== 'number') return NaN;
    var degits1 = _degits(num1), degits2 = _degits(num2);
    num1 = _bignum(num1, degits1), num2 = _bignum(num2, degits2);
    num1 = num1 * num2; return _mininum(num1, degits1 + degits2);
  }

  function _divide(num1, num2) {
    if(typeof num1 !== 'number' || typeof num2 !== 'number') return NaN;
    var degits = Math.max(_degits(num1), _degits(num2));
    num1 = _bignum(num1, degits), num2 = _bignum(num2, degits);
    num1 = num1 / num2; return num1;
  }

  return {
    plus: function(num1, num2) { return _plus(num1, num2); },
    minus: function(num1, num2) { return _minus(num1, num2); },
    times: function(num1, num2) { return _multiply(num1, num2); },
    div: function(num1, num2) { return _divide(num1, num2); }
    };
})();



/* ----------------------------------------------------------------------
*  Others
---------------------------------------------------------------------- */

/* getURLQueryParam
===================================================================== */
function getURLQueryParam() {
  var obj = new Object;
  var pair = location.search.substring(1).split('&');
  for(var i = 0; i < pair.length; i++) {
    var kv = pair[i].split('=');
    obj[kv[0]] = kv.length > 1 ? kv[1] : null;
  }
  return obj;
}

/* replaceURLQueryParam
===================================================================== */
function replaceURLQueryParam(obj) {
  var newquery = Object.entries(obj).map(function(elem) { 
    return elem[1] == null ? elem[0] : elem[0] + '=' + elem[1];
  });
  newquery = newquery.join('&');
  if(newquery != '') newquery = '?' + newquery;
  history.replaceState(null, null, location.href.replace(location.search, newquery));
}
