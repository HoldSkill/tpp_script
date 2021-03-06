/**
 * arr is sectionSeatMapList
 * @param {Array} arr
 */
function pickApiRecommend(arr) {
  const result = {}
  arr.map(section => section.recommendSeatMap).forEach(element => {
    for (const key in element) {
      if (element.hasOwnProperty(key) && element[key].status === '1') {
        result[key]
          ? result[key].push(element[key])
          : (result[key] = [element[key]])
      }
    }
  })
  return result
}
/**
 * figure out rows
 * arr is sorted
 * @param {Array} arr
 */
function calcBestRows(arr, arrLen = arr.length) {
  const isSmallHall = arrLen - 6 <= 4 ? true : false
  if (arrLen <= 6) return arr
  const pivot = Math.floor(arrLen / 2)
  const numberOfOmittedRowsFromLast = Math.floor(pivot / 2)
  const numberOfRowsInFrontOfPivot = isSmallHall ? 1 : 3
  const result = []
  for (let i = 0; i < arrLen; i++) {
    i >= pivot - numberOfRowsInFrontOfPivot &&
    i < arrLen - numberOfOmittedRowsFromLast
      ? result.push(arr[i])
      : null
  }
  return result
}
function isOdd(num) {
  return num % 2 === 1
}

/**
 * figure out the best seats of a row
 * @param {Array} arr
 * @return {Array}
 */
function resultOfRow(arr = [], num) {
  return availableConsecutiveSeatsInRow(bestInRow(arr), num)
}
function bestInRow(arr, arrLen = arr.length) {
  const isNumOfSeatsOdd = isOdd(arrLen)
  if (arrLen <= 10) return arr
  const radius = Math.floor(arrLen / 5)
  const pivot = Math.floor(arrLen / 2)
  return arr.filter(
    (el, idx) =>
      idx >= (isNumOfSeatsOdd ? pivot - radius : pivot - radius - 1) &&
      idx <= pivot + radius
  )
}
function availableConsecutiveSeatsInRow(arr, num) {
  const result = []
  const arrLen = arr.length
  let consecutiveAvaiableSeatNum = 0
  let isPreviousSeatAvaiable = false
  for (let i = 0; i < arrLen; i++) {
    if (arr[i] && arr[i].status === '1') {
      consecutiveAvaiableSeatNum += 1
      isPreviousSeatAvaiable = true
      if (i === arrLen - 1) {
        result.push(
          ...subConsecutiveArr(arr, [i, consecutiveAvaiableSeatNum], num)
        )
      }
    } else {
      if (isPreviousSeatAvaiable === true) {
        result.push(
          ...subConsecutiveArr(arr, [i - 1, consecutiveAvaiableSeatNum], num)
        )
      }
      consecutiveAvaiableSeatNum = 0
      isPreviousSeatAvaiable = false
    }
  }
  return result
}
/**
 *
 * @param {Array} arr
 * @param {Array} idxPrev
 * @param {Number} subArrLen
 */
function subConsecutiveArr(arr, idxPrev, subArrLen) {
  const slicedArr = arr.slice(idxPrev[0] - idxPrev[1] + 1, idxPrev[0] + 1)
  if (slicedArr.length < subArrLen) {
    return []
  }
  const result = []
  for (let i = 0; i <= slicedArr.length - subArrLen; i++) {
    result.push(slicedArr.slice(i, subArrLen + i))
  }
  return result
}
function isSold(obj) {
  return obj.status === '0' ? true : false
}
/**
 * arr is the element of sectionSeatMapList
 * @param {Object} obj
 */
function bestInHall(obj, num) {
  const { seats, maxColumn, minColumn } = obj
  const seatsMap = {}
  seats.forEach(
    (el, idx) => {
      if (!seatsMap[el.row]) {
        seatsMap[el.row] = Array.from({ length: +maxColumn })
      }
      seatsMap[el.row][+el.column - minColumn] = el
    }
    // seatsMap[el.row] ? seatsMap[el.row].push(el) : (seatsMap[el.row] = [el])
  )
  // front to rear
  const rows = Object.keys(seatsMap).sort((a, b) => +a - +b)
  // rows.forEach((el, idx) => {
  //   // left to right
  //   seatsMap[el] = seatsMap[el].sort((a, b) => +a.column - +b.column)
  // })
  const result = []
  calcBestRows(rows.map(el => seatsMap[el])).forEach(row =>
    result.push(...resultOfRow(row, num))
  )
  return result
}

function allAvailableInHall(obj) {
  const { seats } = obj
  return seats.filter(el => el.status === '1')
}

function chooseBestSeat(apiData, config = {}) {
  const result = {}
  const { ticketNum: num } = config
  const hallSeat = apiData.data.returnValue.hallSeatMap
  // pick api recommendSeatMap first
  result.recommend = pickApiRecommend(hallSeat.sectionSeatMapList)
  // choose best in general
  const generalDesiredSeats = []
  const allAvailableSeats = []
  hallSeat.sectionSeatMapList.forEach(hall => {
    generalDesiredSeats.push(...bestInHall(hall, num))
    allAvailableSeats.push(...allAvailableInHall(hall))
  })
  result.general = generalDesiredSeats
  result.allAvailableSeats = allAvailableSeats
  return result
}
function getSelectedIds(d) {
  const ids = []
  d.general.forEach(arr => {
    arr.forEach(el => {
      if (ids.indexOf(el.seatId) === -1) {
        ids.push(el.seatId)
      }
    })
  })
  return ids
}
module.exports = {
  calcBestRows,
  chooseBestSeat,
  bestInRow,
  getSelectedIds,
  availableConsecutiveSeatsInRow
}
