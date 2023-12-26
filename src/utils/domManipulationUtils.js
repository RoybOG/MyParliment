import { waitForElementToExist } from '.'

export function isParticipantHost() {
  const hostControlsButton = document.querySelector(
    'div[jscontroller="upoJje"] button',
  )
  return Boolean(hostControlsButton)
}

export async function extractParticipantDetails() {
  try {
    let participentList = await waitForElementToExist(
      'div.m3Uzve.RJRKn',
      () => {
        document.querySelector('button[data-promo-anchor-id="GEUYHe"]').click()
      },
    )

    let youLabel = await waitForElementToExist(
      'div.m3Uzve.RJRKn div.VfPpkd-aGsRMb span.NnTWjc',
      () => {
        participentList.querySelector('div[role="button"]').click()
      },
    )
    let youItem = youLabel.closest('div[role="listitem"]')
    return {
      participantDetails: {
        username: youLabel.previousSibling?.textContent,
        profileLink: youItem.querySelector('img')?.src,
        googleID: youItem.getAttribute('data-participant-id'),
      },
      isHost: isParticipantHost(),
      muteSymbol: youItem.querySelector('div[jscontroller="mUJV5"]'),
    }
  } catch (err) {
    alert('This page is corrupted, can you please refresh the page?')
    console.log(err)
    return {
      participantDetails: null,
    }
    //Later when I'll read the username and password from the storage, if I don't find it or it is deleted, I'll show the same message and ask the user to refresh the page. I won't read again, only when the original DOM is loaded to prevent the user from corrupting the DOM and thus the save.
  }
}
