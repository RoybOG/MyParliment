import { getUrl } from '../utils'

/* ---------- basic cookie functions -------------------- */
export function formatCookieValue(v) {
  return JSON.stringify(v)
}

export function readCookieValue(v) {
  try {
    return JSON.parse(v)
  } catch {
    return v
  }
}

export async function getCookie(name, url, path = null) {
  const domainCookies = await chrome.cookies.getAll({
    name,
    url: getUrl(url, path),
  })
  const savedCookie = domainCookies.find((c) => c.path == path)
  console.log(savedCookie)
  if (savedCookie) {
    savedCookie.value = readCookieValue(savedCookie.value)
  }
  return savedCookie
}

export async function setCookie(newDetails) {
  console.log(newDetails)
  newDetails.value = formatCookieValue(newDetails.value)

  await chrome.cookies.set(newDetails)
}

async function updateCookie(
  newDetails,
  mergeFunc = (old_v, new_v) => ({ ...old_v, ...new_v }),
) {
  const currentDetails = await getCookie(
    newDetails.name,
    newDetails.url,
    newDetails.path,
  )
  console.log(currentDetails)
  if (currentDetails) {
    newDetails.value = mergeFunc(currentDetails.value, newDetails.value)
    console.log(newDetails)
    await setCookie(newDetails)
  } else {
    await createCookie(
      newDetails.name,
      newDetails.url,
      newDetails.value,
      newDetails.path,
    )
  }
}

export async function createCookie(name, url, value, path = null) {
  let currentDate = new Date()
  currentDate.setDate(currentDate.getDate() + 1)
  await setCookie({
    name,
    url,
    value,
    path,
    httpOnly: true,
    secure: true,
    expirationDate: Math.floor(currentDate.getTime() / 1000),
  })
}
