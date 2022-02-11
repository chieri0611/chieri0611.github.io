/* **********************************************************************
* 
*  Name: common.js
*
*  Description: Common Javascript
*  Author: chieri0611
*  Create: 2022/02/11
*  Update: 2022/02/11
*
********************************************************************** */


/* ======================================================================
*
*  Menu
*    [-] loadMenuButton
*
*  Dialog
*    [-] showDialog
*    [-] closeDialog
*    [-] showListDialog
*    [-] closeListDialog
*    [-] showProgressDialog
*    [-] setProgressValue
*    [-] closeProgressDialog
*
*  Element
*    [-] hasClass
*    [-] isElement
*    [-] toggleClass
*    [-] toggleDisable
*    [-] getRadioValue
*
*  Decimal Number
*
*  Polyfill
*  
====================================================================== */


/* ----------------------------------------------------------------------
*  Menu
---------------------------------------------------------------------- */

/* loadMenuButton
====================================================================== */
function loadMenuButton(id) {
    var menuelem = document.getElementById("menu");
    menuelem.className = "menu_container";
    menuelem.innerHTML = "";

    try {

    var xhr = new XMLHttpRequest();
    xhr.open('GET', "/menu.json", true);
    xhr.setRequestHeader('Content-Type', 'application/json');

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
                btnelem.className = "menu_button"; btnelem.id = element.id
                btnelem.href = element.ref.replace(/\r?\n/g, '&#010;'); 
                if(!element.enable) btnelem.setAttribute("disabled", "disabled");
                if(element.icon != '') {
                    var imgelem = document.createElement('img');
                    var imgowner = document.createElement('div');
                    imgelem.src = element.icon;
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
    if(document.getElementsByClassName("dialog").length > 0) return;

    var overlay = document.createElement('div');
    overlay.className = "overlay";
    if(modal !== true) overlay.setAttribute("onclick", "closeDialog()");

    var dialog = document.createElement('div'); dialog.id = id;
    dialog.className = "dialog hidden";

    if(title) {
        var head_elem = document.createElement('header');
        var title_elem = document.createElement('div');
        title_elem.className = "title"; title_elem.textContent = title;
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
    if(btnevent == null) btnevent = "closeDialog()";
    if(!Array.isArray(btntext)) btntext = [btntext];
    if(!Array.isArray(btntype)) btntype = [btntype];
    if(!Array.isArray(btnevent)) btnevent = [btnevent];
    btntext.map(function(element, idx) {
        var btnelem = document.createElement('button');
        btnelem.textContent = String(element);
        if(btntype.length > idx) {
            if(btntype[idx] == 1) btnelem.className = "exec_button";
        }
        if(btnevent.length > idx) {
            btnelem.setAttribute("onclick", btnevent[idx] !== null ? String(btnevent[idx]) : "closeDialog()");
        } else {
            btnelem.setAttribute("onclick", "closeDialog()");
        }
        foot_elem.appendChild(btnelem);
    });
    dialog.appendChild(foot_elem);

    if(closebutton == true) {
        var close_btn = document.createElement('button');
        close_btn.className = "dialog_close";
        close_btn.setAttribute("onclick", "closeDialog()"); dialog.appendChild(close_btn);
    }

    document.body.appendChild(overlay);
    dialog = document.body.appendChild(dialog);  
    setTimeout(function showdlg() { dialog.className = "dialog"; }, 0);
}


/* closeDialog
====================================================================== */
function closeDialog() {
    var dialog = document.getElementsByClassName("dialog");
    if(dialog.length == 0) return;
    dialog = dialog[0];

    var overlay = document.getElementsByClassName("overlay")[0];
    dialog.className = "dialog hidden";
    setTimeout(function closedlg() {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);  
    }, 100) 
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
    closeDialog();
}


/* showProgressDialog
====================================================================== */
function showProgressDialog(title, description) {
    if(document.getElementById("loadwindow") != null) return;

    var dialog = document.createElement('div');
    dialog.className = "loadwindow"; dialog.id = "loadwindow";

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

    dialog = document.body.appendChild(dialog);  
}


/* setProgressValue
====================================================================== */
function setProgressValue(prog_value, title, description) {
    var dialog = document.getElementById("loadwindow");
    if(dialog == null) return;

    var prog_bar = document.getElementById("progress_bar");
    prog_bar.style = "width: " + prog_value + "%";

    if(title != null) {
        var title_elem = dialog.getElementsByClassName("title")[0];
        title_elem.textContent = String(title);
    }
    if(description != null) {
        var desc_elem = dialog.getElementsByClassName("description")[0];
        desc_elem.textContent = String(description);
    }
}


/* closeProgressDialog
====================================================================== */
function closeProgressDialog() {
    var dialog = document.getElementById("loadwindow");
    if(dialog == null) return;
    document.body.removeChild(dialog);  
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
*  Polyfill
---------------------------------------------------------------------- */
Number.isInteger = Number.isInteger || function(value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

if(!Math.sign) { Math.sign = function(num) {
    return ((num > 0) - (num < 0)) || +num;
}}
