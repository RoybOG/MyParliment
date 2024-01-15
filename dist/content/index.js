import { s as sendAndWait, c as convertToBoolean, a as simulateMute } from '../chunks/index-ef2f4dd5.js';

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "section#ExtHostControls {\r\n  direction: rtl;\r\n  position: relative;\r\n}\r\n\r\nsection#ExtHostControls button {\r\n  box-shadow: none;\r\n  position: absolute;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  margin-top: 1em;\r\n  border: none;\r\n  border-radius: 20%;\r\n  background-color: rgb(240, 240, 240);\r\n  color: black;\r\n  padding: 1em;\r\n  font-family: 'David Libre', serif;\r\n  transition: box-shadow 100ms;\r\n}\r\nsection#ExtHostControls button:hover {\r\n  box-shadow: 0px 0px 5px;\r\n  background-color: rgb(220 220 220);\r\n}\r\n";
styleInject(css_248z);

const getHostButton = () => document.querySelector('div[jscontroller="upoJje"] button');
const getMuteButton = () => document.querySelector('div.Tmb7Fd button[data-is-muted][aria-label*="מיקרופון" i],button[data-is-muted][aria-label*="microphone" i]' //להוסיף לשפות אחרות
);
function createFullElement(element, attributes, inner) {
  console.log(element);
  let el = document.createElement(element);
  if (typeof attributes === 'object') {
    for (let key in attributes) {
      el.setAttribute(key, attributes[key]);
    }
  }
  if (typeof inner == 'string') {
    el.innerText = inner;
  } else if (Array.isArray(inner)) {
    let innerEl;
    for (let innerElDetails of inner) {
      console.log(innerElDetails);
      console.log(typeof innerElDetails);
      if (typeof innerElDetails == 'object') {
        innerEl = createFullElement(innerElDetails.element, innerElDetails.attributes, innerElDetails.inner);
      } else {
        innerEl = document.createElement(innerElDetails);
      }
      el.appendChild(innerEl);
    }
  }
  return el;
}
function waitForElementToExist(selector, ifNotExists = () => {}) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }
    ifNotExists();
    // setTimeout(reject, 30000);
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true
    });
  });
}
async function startMeeting() {
  if (await sendAndWait('createMeetDoc')) {
    alert('הדיון התחיל בהצלחה! אתה מנחה הדיון!');
  } else {
    alert('לא הצלחת להתחיל את הדיון, או שמנחה אחר כבר התחיל או שהמערכת לא הצליחה! נסה מאוחר יותר!');
  }
}
async function setHostControls() {
  if (!(await sendAndWait('canCreateMeetDoc'))) {
    console.log('file does exist');
    return;
  }
  const hostControlsButton = getHostButton();
  if (!hostControlsButton) return null;
  let extControls = createFullElement('section', {
    id: 'ExtHostControls'
  }, [{
    element: 'div',
    attributes: {
      class: 'qNFnn',
      style: 'text-align: left;'
    },
    inner: 'My Parliment'
  }, {
    element: 'button',
    inner: 'להתחלת הדיון'
  }]);
  extControls.querySelector('button').addEventListener('click', startMeeting);
  hostControlsButton.addEventListener('click', async function (e) {
    if (convertToBoolean(this.getAttribute('aria-pressed'))) return;
    console.log('opening');
    let hostControlsPanel = await waitForElementToExist('div.ddBMJb');
    console.log(hostControlsPanel);
    console.log('creating');
    await setTimeout(() => {
      //tHIS AWWAIT
      hostControlsPanel.appendChild(extControls);
    }, 500);
    console.log(extControls);
  });
}
function injectHead() {
  const docHead = document.querySelector('head');
  docHead.innerHTML += '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=David+Libre:wght@700&display=swap" rel="stylesheet">';
}
async function injectPartipantControls() {
  try {
    const participentList = await waitForElementToExist('div.m3Uzve.RJRKn', () => {
      document.querySelector('button[data-promo-anchor-id="GEUYHe"]').click();
    });
    const participantItems = participentList.querySelectorAll('div[role="listitem"]');
    let actionsButton;
    console.log(participantItems);
    for (let participantItem of participantItems) {
      actionsButton = participantItem.querySelector('div[jsslot] button');
      console.log(actionsButton);
      actionsButton.addEventListener('click', () => {
        console.log('action clicked!');
      });
    }
  } catch {}
}
function injectHTML() {
  injectHead();
  setHostControls();
  injectPartipantControls();
}
async function extractParticipantDetails() {
  try {
    var _youLabel$previousSib, _youItem$querySelecto;
    let participentList = await waitForElementToExist('div.m3Uzve.RJRKn', () => {
      document.querySelector('button[data-promo-anchor-id="GEUYHe"]').click();
    });
    let youLabel = await waitForElementToExist('div.m3Uzve.RJRKn div.VfPpkd-aGsRMb span.NnTWjc', () => {
      participentList.querySelector('div[role="button"]').click();
    });
    let youItem = youLabel.closest('div[role="listitem"]');
    return {
      participantDetails: {
        username: (_youLabel$previousSib = youLabel.previousSibling) === null || _youLabel$previousSib === void 0 ? void 0 : _youLabel$previousSib.textContent,
        profileLink: (_youItem$querySelecto = youItem.querySelector('img')) === null || _youItem$querySelecto === void 0 ? void 0 : _youItem$querySelecto.src,
        googleID: youItem.getAttribute('data-participant-id')
      },
      isHost: Boolean(getHostButton()),
      muteSymbol: youItem.querySelector('div[jscontroller="mUJV5"]')
    };
  } catch (err) {
    alert('This page is corrupted, can you please refresh the page?');
    console.log(err);
    return {
      participantDetails: null
    };
    //Later when I'll read the username and password from the storage, if I don't find it or it is deleted, I'll show the same message and ask the user to refresh the page. I won't read again, only when the original DOM is loaded to prevent the user from corrupting the DOM and thus the save.
  }
}
/*

*/

//------------------------------------ injecting--------------------------------------

//------------------------------------muting--------------------------------------

function updateMuteButton(hasPermission) {
  const muteButton = getMuteButton();
  console.log(hasPermission);
  muteButton.disabled = !hasPermission;
  if (!convertToBoolean(muteButton.getAttribute('data-is-muted')) && !hasPermission) {
    simulateMute();
  }
}
async function checkParticipant() {
  //This function needs to run on 3 different occations: on loading page, on changing speaking and on changing who has permission
  /* await chrome.runtime.sendMessage({ type: 'getDoc' }, (res) => {
    console.log(res)
  })*/

  await chrome.runtime.sendMessage({
    type: 'CHECKPERMISSION',
    participantDetails: {}
  }, res => {
    console.log(res);
    updateMuteButton(res.canSpeak);
  });
}
function setupMuteObserver(target) {
  const config = {
    attribute: true,
    attributeOldValue: true
    //attributeFilter: ["data-is-muted"],
  };
  const observer = new MutationObserver(async l => {
    console.log(l);
    // observer.disconnect();
    await checkParticipant();
    /* await setTimeout(async () => { //In slower computers this can be exploited. I prefer double reads(that anyway with be alot becuase they will try a lot to press the mute so I anyways need to find a a way to cache reads)
        console.log("g");
        observer.observe(target, config);
      }, 70);*/
  });
  window.onbeforeunload = () => {
    //This makes sure when not too many observers will be created on the browser
    observer.disconnect();
  };
  observer.observe(target, config);
  return observer;
}

//-----------------------------------the main function------------------------------------------------------

function _setUpListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
      console.log(message);
      switch (message.type) {
        case 'documentUpdated':
          updateMuteButton(message.canSpeak);
          sendResponse(true);
          break;
      }
    })();
    return true; //https://stackoverflow.com/questions/44056271/chrome-runtime-onmessage-response-with-async-await
  });
  console.log('setting up listener');
}
async function setup() {
  await _setUpListener();
  console.log('init');
  console.log(await sendAndWait('init')); //Waits for the background script to load the document from FS
  console.log('set up!');
  console.log(Boolean(getHostButton()));
  let {
    participantDetails,
    isHost,
    muteSymbol
  } = await extractParticipantDetails();
  console.log(participantDetails);
  console.log(muteSymbol);
  if (participantDetails && muteSymbol) {
    await chrome.runtime.sendMessage({
      type: 'COOKIES-GET',
      details: {}
    }, res => {
      participantDetails.UUID = res.UUID;
    });
    console.log(participantDetails);
    setupMuteObserver(muteSymbol);
    injectHTML(); // this will asyncronysly wait until the host opens up the host controls

    await chrome.runtime.sendMessage({
      type: 'COOKIES-GET'
    }, console.log);
    console.log('moving on...');
  } else {
    alert('יש בעיה בדף שלכם, כדאי לטעון מחדש');
  }
}
(async () => {
  try {
    console.log('b');
    await waitForElementToExist('button[jsname="A5il2e"]');
    console.log('e');
    await setup();
  } catch (err) {
    console.log('failed');
    console.log(err);
  }

  // `tab` will either be a `tabs.Tab` instance or `undefined`.
})();
