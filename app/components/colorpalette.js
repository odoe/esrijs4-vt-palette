define([], function() {
  var COLORS = {};
  var colorPalette = undefined;
  var listItems = [];
  var TOO_DARK = 190;

  // isTooDark :: String -> Boolean
  function isTooDark(c) {
    // http://stackoverflow.com/a/12043228/241635
    var c = c.substring(1);      // strip #
    var rgb = parseInt(c, 16);   // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff;  // extract red
    var g = (rgb >>  8) & 0xff;  // extract green
    var b = (rgb >>  0) & 0xff;  // extract blue
    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    console.log(luma, c);
    return luma < TOO_DARK;
  }

  // createListContainer :: [String] -> HTMLElement
  function createListContainer(colors) {
    // Color lists
    var colorList = document.createElement("ul");
    colorList.className = "list-group";
    var docFrag = document.createDocumentFragment();
    listItems = colors.map(function(color) {
      var li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = color;
      li.style["background-color"] = color;
      if (isTooDark(color)) {
        li.style.color = "#fff";
      }
      else {
        li.style.color = "#4c4c4c";
      }
      docFrag.appendChild(li);
      return li;
    });
    colorList.appendChild(docFrag);
    return colorList;
  }

  // createButton :: LayerAndStyle -> HTMLElement
  function createButton(spec) {
    var vtStyle = spec.style;
    var layer = spec.layer;
    var button = document.createElement("button");
    button.className = "btn btn-primary";
    button.innerHTML = "Apply Colors";
    button.addEventListener("click", function() {
      var style = JSON.stringify(vtStyle);
      var keys = Object.keys(COLORS);
      var i = 0;
      keys.map(function(key) {
        style = style.split(key).join(colorPalette[i]);
        style = style.split(key.toLowerCase()).join(colorPalette[i]);
        i++;
      })
      var obj = JSON.parse(style);
      layer.loadStyle(obj);
    });
    return button;
  }

  // updateColorList :: [String] -> void
  function updateColorList(colors) {
    var color = undefined;
    listItems.forEach(function(li, idx) {
      color = colors[idx];
      li.innerHTML = color;
      li.style["background-color"] = color;
      if (isTooDark(color)) {
        li.style.color = "#fff";
      }
      else {
        li.style.color = "#4c4c4c";
      }
    });
  }

  // createColors :: Style -> [String]
  function createColors(style) {
    return style.layers.map(function(layer) {
      var clrs = [];
      if (layer.paint) {
        if (layer.paint["background-color"]) {
          clrs.push(layer.paint["background-color"].toUpperCase());
        }
        if (layer.paint["fill-color"]) {
          clrs.push(layer.paint["fill-color"].toUpperCase());
        }
        if (layer.paint["fill-outline-color"]) {
          clrs.push(layer.paint["fill-outline-color"].toUpperCase());
        }
        if (layer.paint["line-color"]) {
          clrs.push(layer.paint["line-color"].toUpperCase());
        }
        if (layer.paint["text-color"]) {
          clrs.push(layer.paint["text-color"].toUpperCase());
        }
        if (layer.paint["text-halo-color"]) {
          clrs.push(layer.paint["text-halo-color"].toUpperCase());
        }
      }
      return clrs;
    })
    .reduce(function(a, b) {
      return a.concat(b);
    }, []);
  }

  // getAllSchemes :: _ -> [String]
  function getAllSchemes() {
    var names = ["sequential", "diverging", "qualitative"].map(function(type) {
      return palette.listSchemes("cb-" + type).map(function(scheme) {
        return scheme.scheme_name;
      });
    }).reduce(function(a, b) {
      return a.concat(b);
    }, []);
    return ["tol", "tol-rainbow"].concat(names);
  }

  // colorSelector :: Number -> HTMLElement
  function colorSelector(count) {
    var select = document.createElement("select");
    select.className = "form-control";
    var schemes = getAllSchemes();
    var cp = palette(schemes[0], count);
    colorPalette = cp.map(function(p) {
      return "#" + p.toUpperCase();
    });
    var docFrag = document.createDocumentFragment();
    schemes.forEach(function(scheme) {
      var option = document.createElement("option");
      option.value = scheme;
      option.text = scheme;
      docFrag.appendChild(option);
    });
    select.appendChild(docFrag);
    select.addEventListener("change", function(event) {
      var selectedScheme = select.options[select.selectedIndex].text;
      console.log("Update to color: ", selectedScheme);
      colorPalette = palette(selectedScheme, count).map(function(p) {
        return "#" + p.toUpperCase();
      });
      updateColorList(colorPalette);
    });
    return select;
  }

  var Options = {
    style: Object,
    layer: Object
  };
  // create :: Options -> HTMLElement;
  function create(spec) {
    var style = spec.style;
    var layer = spec.layer;
    var allcolors = createColors(style);
    var colors = allcolors.filter(function(x, i) {
      return allcolors.indexOf(x) === i;
    })
    colors.forEach(function(color) {
      COLORS[color] = color;
    });
    var colorCount = colors.length;
    var selector = colorSelector(colorCount);
    var container = document.createElement("div");
    var paletteList = createListContainer(colorPalette);
    var button = createButton({
      style: style,
      layer: layer
    });
    container.appendChild(selector);
    container.appendChild(paletteList);
    container.appendChild(button);
    return container;
  }

  return Object.freeze({
    create: create
  });

});