import { w as waitForElementToExist, c as convertToBoolean, s as simulateMute } from '../chunks/index-03980a4a.js';

function isParticipantHost() {
  const hostControlsButton = document.querySelector('div[jscontroller="upoJje"] button');
  return Boolean(hostControlsButton);
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
      isHost: isParticipantHost(),
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

//------------------------------------ injecting--------------------------------------
const getMuteButton = () => document.querySelector('div.Tmb7Fd button[data-is-muted][aria-label*="מיקרופון" i],button[data-is-muted][aria-label*="microphone" i]' //להוסיף לשפות אחרות
);

//------------------------------------muting--------------------------------------

function updateMuteButton(hasPermission) {
  const muteButton = getMuteButton();
  muteButton.disabled = !hasPermission;
  if (!convertToBoolean(muteButton.getAttribute('data-is-muted')) && !hasPermission) {
    simulateMute();
  }
}
async function checkParticipant() {
  //This function needs to run on 3 different occations: on loading page, on changing speaking and on changing who has permission
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
async function setup() {
  console.log();
  console.log(isParticipantHost());
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
    await checkParticipant();
    setupMuteObserver(muteSymbol);
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
