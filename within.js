// Payload data (served from server/API/carrier pigeon/whatever)
var application = {
    "payload": {
        "document": {
            "main": {
                "title": "WITH - The First Application",
                "css": {"uri": "http://necolas.github.com/normalize.css/2.1.0/normalize.css"},
                "css": {"uri": "some-other-css"},
                "section": {
                    "logo": {
                        "img": {
                            "src": "http://klassica.com/images/logo.png", 
                            "alt": "WITH.in Logo",
                            "title": "WITH - A project authored by A Priori, NYC"
                        }
                    },
                    "welcome": {
                        "h1": "Welcome to WITH - A Labratory for Innovative IT Projects", 
                        "h3": "WITH Is Technology for Humans"
                        "p": "This is the WITH Project, a new approach to web programming."
                    },
                    "credits": {
                        "author": "Created by Arthur Ketcham",
                        "organization": "A Klassica.org Project",
                        "uri": "http://klassica.org/with.in"
                    },
                    "about": "This is a project with a small footprint, yet with large aspirations. This first proof of concept revolves around the idea of building web applications without the assumed fundamentals of traditional web programming.",
                    "more": "Go ahead and view the source of this page. You'll notice something unique. (Almost) NO HTML! “WTF?” you say to yourself. Instead of HTML, a lightly structured bit of JSON is used to create this page. JSON excels at being a very human writable and readable format of information. I speculate that it may be a better replacement for HTML in web applications, and this is the idea I'm experiementing with. Overall, the goal of the WITH projects is to find novel ways to use technology to benifit small, decentralized communities, and improve access to web-based creativity and solutions for the common “use-cases” to the forefront of web development in a way that benifits anyone and everyone.",
                }
            },
            "html": null
        }
    }
};

/////////////////////////////////////////////////////
// Intitialize the WITH Application as a Web-based UI
window.onload = function() {
    // App Config
    with_frontend = application;
    with_backend = null; // For now... (this is intended to be a URI to JSON object, which describes an API)
    with_ui_type = "html";
    with_startpage = "main"; // The root document shares this name, under application.payload.document
    app = new With(with_frontend, with_backend, with_startpage);
};



////////////////////////////////////////////////////////////////////////////////////////////////////
// BEGIN OF WITH.IN FRAMEWORK/LIBRARY
WITH_VERSION = "0.0.0.6";
WithModel = {};

function With(appFE, appBE, startPage) {
    console.log(appFE);
    
    WithModel.frontend = appFE;
    WithModel.backend = appBE;
    WithModel.startPage = startPage;
    WithModel.loadPage(startPage);

    WithModel.printDebugInfo();
}

WithModel.loadPage = function(page) {
    console.log("Loading Page: " + page);
    
    // Build HTML document
    if (WithModel.validateFrontendHasPage(page)) {
        // TODO: Validate document data
        var dom = WithModel.frontend.payload.document;
        
        // Experimental building of document data
        //dom.html.body.appendChild(document.createTextNode("This is WITH.IN v" + WITH_VERSION));
        document.title = dom[page].title;
        dom.html = WithModel.buildHTMLDocument(dom[page]);
        // ***** Build the actual document DOM ****** //
        document.removeChild(document.documentElement); // Clear DOM
        var html = document.appendChild(dom.html);
    }
}

WithModel.validateFrontendHasPage = function(page) {
    if (WithModel.frontend.payload.document.hasOwnProperty(page)) {
        return true;
    } else {
        console.log("With Frontend does not have requested page \"" + page + "\"");
        return false;
    }        
}

WithModel.buildHTMLDocument = function(domJSON) {
    var html = {"head": null, "body": null};
    html = document.createElement('html');
    html.head = html.appendChild(document.createElement('head'));
    html.body = html.appendChild(document.createElement('body'));
    var body_children = WithModel.buildHTMLElement(domJSON);
    console.log(body_children);
    for(var i in body_children) {
        if (body_children.hasOwnProperty(i)) {
            html.body.appendChild(body_children[i]);
        }
    }
    console.log(html);
    return html;
}

WithModel.buildHTMLElement = function(domJSON) {
    var html = [];
    for (var prop in domJSON) {
        if (domJSON.hasOwnProperty(prop)) {
            // A. Container element
            //     - has array or object
            // B. Attribute-Required Elements: Images and Links
            // C. Simple HTML element
            //    - allowed tags: div, p, span, h1, h2, h3, h4, img, a, section
            // D. Implicit paragraph with text contents
            // TODO: Handling of attibutes...
            console.log("+++Examining property: " + prop);
            
            // A. Container Elements
            if ((typeof domJSON[prop] == "array" || typeof domJSON[prop] == "object") && (!['img', 'a', 'css'].contains(prop))) {
                console.log("------------A");
                console.log('--> ' + prop + " is a container, going recrusive!");
                // This recursive call duplicates code in buildHTMLDocument(). FIXME.
                var element = document.createElement('div');
                element.id = prop;
                var element_children = WithModel.buildHTMLElement(domJSON[prop]);
                for(var i in element_children) {
                    if (element_children.hasOwnProperty(i)) {
                        element.appendChild(element_children[i]);
                    }
                }
                //console.log(element);
                html.push(element); 
                // End code-dupe
                console.log("++++++++++++A");
                
            // B.1 Attribute-required elements (for now, only images and 
            } else if (['img', 'a'].contains(prop)) {
                // TODO: Validate for required attributes
                console.log("------------B");
                var element = document.createElement(prop);
                var element_attrs = domJSON[prop];
                for (var i in element_attrs) {
                    if (['src', 'href', 'link', 'alt', 'ref', 'title', 'data'].contains(i)) {
                        element.setAttribute(i, element_attrs[i]);
                    }
                }
                html.push(element); 
                console.log("++++++++++++B");
                
            // B.2 Load CSS
            } else if (prop == 'css') {
                if (domJSON[prop].hasOwnProperty('uri')) {
                    var csslink = document.createElement("link");
                    csslink.setAttribute("rel", "stylesheet");
                    csslink.setAttribute("type", "text/css");
                    csslink.setAttribute("href", domJSON[prop]["uri"]);
                    html.push(csslink); 
                }
                
            // C. Flat, Normal elements
            } else if (['div', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'section'].contains(prop)) {
                console.log("------------C");
                // TODO: Support attributes!
                //console.log("New HTML element: <" + prop + ">");
                element = document.createElement(prop);
                element.innerHTML = domJSON[prop];
                //console.log(element)
                html.push(element);
                //console.log(domJSON[prop]);
                console.log("++++++++++++C");
                
            // D. Implicit Paragraph with text
            } else if (typeof domJSON[prop] == "string" && !(['title'].contains(prop))) {
                console.log("------------D");
                element = document.createElement('p');
                element.id = prop;
                element.innerHTML = domJSON[prop];
                //console.log(element)
                html.push(element); 
                //console.log(domJSON[prop]);
                console.log("++++++++++++D");
               
            } else {
                console.log("WARNING: Ignoring unknown property \"" + prop + "\"");
            }
        }
    }
    return html;
}

WithModel.printDebugInfo = function() {
    if (typeof console == Object) {
        // Debug Output
        console.log("--- JSON DOM ---");
        console.log(dom);
        console.log("--- HTML DOCUMENT ---");
        console.log(document);
    }
}

// Give Array a contains() method
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

// END WITH.IN
////////////////////////////////////////////////////////////////////////////////////////////////////
