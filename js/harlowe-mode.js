CodeMirror.defineMode("harloweMod", function() {
  return {
    token: function(stream) {
      // 1) Eat all whitespace (spaces, tabs, newlines)
      if (stream.eatSpace()) return null;

      // 2) Line-start structural rules
      if (stream.sol()) {
        if (stream.match(/----+/))               return "hr";
        if (stream.match(/!{1,5}\s/))            return "header";
        if (stream.match(/\*\s/))               return "list";
        if (stream.match(/#\s/))                return "list";
        if (stream.match(/>+\s?/))              return "quote";
      }

      // 3) Comments
      if (stream.match(/\/%[\s\S]*?%\//))       return "comment";

      // 4) Inline error & styling marks
      if (stream.match(/@@error@@/))            return "error";
      if (stream.match(/@@[^@]+@@/))            return "meta";

      // 5) Bold / italics / underline / strike / sub/sup
      if (stream.match(/''[^']+''/))            return "strong";
      if (stream.match(/\/\/[^\/]+\/\//))       return "em";
      if (stream.match(/__[^_]+__/))            return "underline";
      if (stream.match(/==[^=]+==/))            return "strikethrough";
      if (stream.match(/~~[^~]+~~/))            return "atom";
      if (stream.match(/\^\^[^\^]+\^\^/))       return "atom";

      // 6) Macros
      if (stream.match(/\(\s*(?:set|print|random|if|else-if|else)\s*:/)) {
        return "keyword";
      }

      // 7) Braces
      if (stream.match(/[{}]/))                 return "bracket";

      // 8) Twine links
      if (stream.match(/\[\[[^\]]+\]\]/))       return "link";
      if (stream.match(/->/))                   return "operator";

      // 9) Variables, numbers, strings, operators
      if (stream.match(/\$[A-Za-z_]\w*/))        return "variable-2";
      if (stream.match(/\b\d+(\.\d+)?\b/))       return "number";
      if (stream.match(/"([^"\\]|\\.)*"/))       return "string";
      if (stream.match(/[+\-*/=<>!]+/))          return "operator";

      // 10) FALLBACK: consume one character, never hang
      stream.next();
      return null;
    }
  };
});
