const targetNode = document.querySelector('ytd-app');
const config = { childList: true, subtree: true };
let debounceTimeout;
let observer;

function transformTitle(title) {
  return title.split("|").slice(-2).join("|").replace(/[0-9]+\s?-\s?[0-9]+|[0-9]+\s?(\([0-9]+\))?-(\([0-9]+\))\s?[0-9]+/g, "-");
};

function transformElement($element) {
  // console.log("transformElement", $element, $element.children().length)
  if($element.length == 0) return;
  if ($element.find("yt-formatted-string").length > 0) {
    $element.find("yt-formatted-string").html(transformTitle($element.find("yt-formatted-string").html()));
  } else {
    $element.html(transformTitle($element.html()));
  }
};

function transformElementTitle($element) {
  // console.log("transformElementTitle", $element)
  if($element.length == 0) return;
  $element.attr("title", transformTitle($element.attr("title")));
};

function blurThumbnail($element) {
  // console.log("blurThumbnail", $element)
  if($element.length == 0) return;
  $element.closest("div#dismissible").find("ytd-thumbnail yt-image img").css("filter", "blur(50px)");
  $("#thumbnail-container.ytd-video-preview").css("opacity", "0");
};

function main() {
  $("div#meta h3 a, div.details div.metadata a h3 span").filter(function () {
    // console.log("main",$(this).attr("title"))
    return $(this).attr("title").endsWith("RESUMEN");
  }).each(function () {
    var $element = $(this);
    transformElement($element);
    transformElementTitle($element);
    blurThumbnail($element);
  });
  if(window.location.pathname == "/watch"){
    // console.log("/watch")
    transformElement($("head title"));
    transformElement($("div#title h1"));
  }
};

function onPageChange() {
  // console.log("Page changed!");
  if (observer) observer.disconnect();
  main();
  setTimeout(()=>{
    if (observer) observer.observe(targetNode, config); 
  },100);
}

function debouncedOnPageChange() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(onPageChange, 100);
}

function observeMutations(mutationsList, observer) {
  for (const mutation of mutationsList) {
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
          onPageChange();
          break;
      }
  }
}

function initObserver() {
  observer = new MutationObserver(observeMutations);
  observer.observe(targetNode, config);
}

window.addEventListener('load', () => {
  main();
  initObserver();
});