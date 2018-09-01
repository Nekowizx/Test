// Generated by CoffeeScript 1.11.1

/*
https://spreadsheets.google.com/feeds/worksheets/{SHEET-ID}/public/basic?alt=json       get grid ids
https://spreadsheets.google.com/feeds/list/{SHEET-ID}/{GRID-ID}/public/values?alt=json  get whole sheet data
https://spreadsheets.google.com/feeds/cells/{SHEET-ID}/{GRID-ID}/public/values          get all cell data
alt=json                                                                                return json
alt=json-in-script&callback={CALLBACK}                                                  return data to callback function

https://spreadsheets.google.com/feeds/worksheets/1wzAwAH4rJ72Zw6r-bjoUujfS5SMOEr38s99NxKmNk4g/public/basic?alt=json
 */
var Setting, wizLoader,
  hasProp = {}.hasOwnProperty;

Setting = {
  localStorage: false,
  cache: {
    adLoading: "1",
    searchMinLength: "1",
    searchMaxResult: "25"
  },
  init: function() {
    var key, localSetting, ref, result;
    Setting.localStorage = Setting.localStorageSupport();
    if (Setting.localStorage) {
      localSetting = localStorage.getItem("wizSetting");
    } else {
      localSetting = util.getCookie("wizSetting");
    }
    Setting.cache = $.extend({}, Setting.cache, JSON.parse(localSetting));
    ref = Setting.cache;
    for (key in ref) {
      if (!hasProp.call(ref, key)) continue;
      result = ref[key];
      $('.' + key).val(result);
    }
    if (Setting.get("adLoading") !== "1") {
      return $("#overlay-loading-ad").remove();
    }
  },
  get: function(key) {
    return Setting.cache[key];
  },
  save: function(json) {
    var j, k, len, localSetting, v;
    localSetting = {};
    for (k = j = 0, len = json.length; j < len; k = ++j) {
      v = json[k];
      localSetting[v.name] = v.value;
    }
    Setting.cache = localSetting;
    if (Setting.localStorage === true) {
      return localStorage.setItem("wizSetting", JSON.stringify(localSetting));
    } else {
      return util.setCookie("wizSetting", JSON.stringify(localSetting), "");
    }
  },
  localStorageSupport: function() {
    var e;
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      return true;
    } catch (error) {
      e = error;
      return false;
    }
  }
};

wizLoader = (function() {
  function wizLoader() {}

  wizLoader.data = {
    db: TAFFY()
  };

  wizLoader.loadCount = 0;

  wizLoader.option = {
    excelIds: {
      qte: {
        sheedId: "10UXXGpmr29PUhDH1AFmLThk2sivTwprRYIg2W3XBWfg",
        gridId: "1"
      }
    }
  };

  wizLoader.addScript = function(entry) {
    var s, src;
    src = "https://spreadsheets.google.com/feeds/cells/" + entry.sheedId + "/" + entry.gridId + "/public/values?alt=json-in-script&callback=wizLoader.load";
    s = document.createElement('script');
    s.setAttribute('src', src);
    return document.body.appendChild(s);
  };

  wizLoader.load = function(data) {
    var tmp;
    tmp = data.feed.id.$t.split('/');
    if (tmp.length === 9) {
      return this._loadNormal([data.feed.entry, '四選題']);
    }
  };

  wizLoader._loadNormal = function(indata) {
    var col, data, db, entry, index, keys, name, tmp, xcount;
    data = indata[0];
    name = indata[1];
    tmp = {};
    col = 0;
    xcount = 0;
    keys = ['', '', 'question', 'answer'];
    db = [];
    for (index in data) {
      entry = data[index];
      if (parseInt(entry.gs$cell.row) <= 1) {
        continue;
      }
      col = parseInt(entry.gs$cell.col);
      if (col >= 1 && col <= 3) {
        if (col === 1) {
          tmp = {};
        }
        tmp[keys[col]] = entry.content.$t;
        if (col === 3) {
          if (name === '四選題') {
            tmp['type'] = '四選題';
          }
          tmp['fulltext'] = ("" + tmp['question'] + tmp['answer']).toLowerCase();
          db.push(tmp);
        }
      }
      xcount++;
      $("#loaded-count").text(xcount + '///' + Object.keys(this.option.excelIds).length);
    }
    wizLoader.data.db.insert(db);
    return this._loadComplete();
  };

  wizLoader._loadComplete = function() {
    this.loadCount++;
    if (this.loadCount === Object.keys(this.option.excelIds).length) {
      $("#overlay-loading").remove();
      $("#load-count").text('共讀取 ' + this.data.db().count() + ' 個問題。');
      $("#result-limit").html("<span class='hidden-xs'>僅顯示</span>前 <a href='#' data-toggle='modal' data-target='#setting-modal'>" + (Setting.get('searchMaxResult')) + " </a>個<span class='hidden-xs'>結果</span>。");
    } else {
      $("#loaded-count").text(this.data.db().count() + '///' + Object.keys(this.option.excelIds).length);
    }
  };

  wizLoader.htmlEncode = function(html) {
    return document.createElement('a').appendChild(document.createTextNode(html)).parentNode.innerHTML;
  };

  wizLoader.highlight = function(keyword, msg) {
    var j, kw, len;
    if (Array.isArray(keyword)) {
      for (j = 0, len = keyword.length; j < len; j++) {
        kw = keyword[j];
        msg = msg.split(kw).join("<strong>" + kw + "</strong>");
      }
    } else {
      msg = msg.split(keyword).join("<strong>" + keyword + "</strong>");
    }
    return msg;
  };

  wizLoader._initEvent = function() {
    $(".form").submit(function(e) {
      e.preventDefault();
      return false;
    });
    $(".from-source").on("change", function() {
      return $("#inputKeyword").trigger("keyup");
    });
    $("#result").on("click", ".btn-more", function() {
      var data, pos, text, tr, trOffset, type;
      tr = $(this).parents("tr");
      type = tr.data("type");
      pos = tr.data("pos");
      trOffset = tr.offset();
      data = {};
      text = '';
      text = "請直接使用上方回報系統，謝謝";
      $("#question-info").css({
        top: trOffset.top,
        left: trOffset.left,
        width: tr.width(),
        height: tr.height()
      }).addClass("active");
      return $("#question-info .info div").html(text);
    });
    $("#question-info").on("click", ".btn-close", function() {
      return $("#question-info").removeClass("active");
    });
    $("#question-info").on("click", "#question-report", function() {
      var answer, question, url;
      question = encodeURIComponent($(this).data("question"));
      answer = encodeURIComponent($(this).data("answer"));
      url = "https://docs.google.com/forms/d/1GYyqSKOfF2KMkMGfEuKtyE8oZadgTRRj_ZClYZRX2Qc/viewform?entry.699244241=%E9%A1%8C%E7%9B%AE%EF%BC%9A" + question + "%0A%E5%8E%9F%E5%A7%8B%E7%AD%94%E6%A1%88%EF%BC%9A" + answer + "%0A%E6%AD%A3%E7%A2%BA%E7%AD%94%E6%A1%88%EF%BC%9A";
      $("#report-modal iframe").attr("src", url);
      return $('#report-modal').modal('show');
    });
    $("#inputKeyword").on("keyup", function() {
      var html, i, j, l, len, limit, ref, result, tmp, tmp2, type, v, val;
      val = $(this).val();
      val = val.replace(/\s\s+/g, ' ');
      $("#question-info").removeClass("active");
      $("#result").html("");
      if (val.length < Setting.get("searchMinLength")) {
        return;
      }
      val = val.toLowerCase();
      type = $(".from-source:checked").map(function() {
        return this.value;
      }).get();
      result = null;
      try {
        limit = parseInt(Setting.get("searchMaxResult"), 10);
        if (val.split(" ").length > 1) {
          val = val.split(" ");
          tmp = [];
          tmp2 = val;
          for (i = j = 0, ref = tmp2.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
            if (tmp.indexOf(tmp2[i]) === -1) {
              tmp.push(tmp2[i]);
            }
          }
          val = tmp;
          for (i = l = 0, len = val.length; l < len; i = ++l) {
            v = val[i];
            if (v === "") {
              delete val[i];
            }
          }
          result = wizLoader.data.db(function() {
            var keyword, len1, m;
            if ($.inArray(this.type, type) === -1) {
              return false;
            }
            for (m = 0, len1 = val.length; m < len1; m++) {
              keyword = val[m];
              if (this.fulltext.indexOf(keyword) === -1) {
                return false;
              }
            }
            return true;
          }).limit(limit);
        } else {
          val = [val];
          result = wizLoader.data.db({
            type: type
          }, {
            fulltext: {
              likenocase: val
            }
          }).limit(limit);
        }
      } catch (error) {
        return;
      }
      html = "";
      result.each(function(r) {
        if (typeof r.question === "undefined") {
          return true;
        }
        if (r.type === "分類題") {
          return html += '<tr data-pos="XXD" data-type="' + r.type + '"><td class="td-more"><a href="javascript:void(0);" class="btn-more">更多</a></td><td><div class="question">' + wizLoader.highlight(val, r.question) + '</div><div class="text-danger">' + wizLoader.htmlEncode(r.answer).replace(/\n/, "<br />") + '</div></td></tr>';
        } else if (r.type === "連連看") {
          return html += '<tr data-pos="XXD" data-type="' + r.type + '"><td class="td-more"><a href="javascript:void(0);" class="btn-more">更多</a></td><td><div class="question">' + wizLoader.highlight(val, r.question) + '</div><div class="text-danger">' + wizLoader.htmlEncode(r.answer).replace(/、/g, "<br />") + '</div></td></tr>';
        } else {
          return html += '<tr data-pos="XXD" data-type="' + r.type + '"><td class="td-more"><a href="javascript:void(0);" class="btn-more">更多</a></td><td><div class="question">' + wizLoader.highlight(val, r.question) + '</div><div class="text-danger">' + wizLoader.htmlEncode(r.answer) + '</div></td></tr>';
        }
      });
      $("#result").append(html);
    });
    $(".list-type, .list-stype, .list-color").on("change", function() {
      var color, html, result, stype, type;
      type = $(".list-type:checked").val();
      stype = "";
      color = "";
      result = wizLoader.data.db({
        type: type
      });
      $("#result-list").html("");
      html = "";
      result.each(function(r) {
        if (r.type === "分類題") {
          return html += '<tr data-pos="XXD" data-type="' + r.type + '"><td><div class="question">' + r.question + '</div><div class="text-danger">' + wizLoader.htmlEncode(r.answer).replace(/\n/, "<br />") + '</div></td></tr>';
        } else if (r.type === "連連看") {
          return html += '<tr data-pos="XXD" data-type="' + r.type + '"><td><div class="question">' + r.question + '</div><div class="text-danger">' + wizLoader.htmlEncode(r.answer).replace(/、/g, "<br />") + '</div></td></tr>';
        } else {
          return html += '<tr data-pos="XXD" data-type="' + r.type + '"><td><div class="question">' + r.question + '</div><div class="text-danger">' + wizLoader.htmlEncode(r.answer) + '</div></td></tr>';
        }
      });
      $("#result-list").append(html);
    });
  };

  wizLoader.init = function() {
    var entry, ref, type;
    ref = this.option.excelIds;
    for (type in ref) {
      entry = ref[type];
      this.addScript(entry);
    }
    this._initEvent();
  };

  $("#form-setting").on("submit", function(e) {
    e.preventDefault();
    Setting.save($("#form-setting").serializeArray());
    $('#setting-modal').modal('hide');
    $("#result-limit").html("<span class='hidden-xs'>僅顯示</span>前 <a href='#' data-toggle='modal' data-target='#setting-modal'>" + (Setting.get('searchMaxResult')) + " </a>個<span class='hidden-xs'>結果</span>。");
    return false;
  });

  return wizLoader;

})();

$(function() {
  return Setting.init();
});
