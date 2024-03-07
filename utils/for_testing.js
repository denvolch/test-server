const reverse = string => {
    return string
        .split('')
        .reverse()
        .join('')
}

const average = array => {
    const reducer = (sum, item) => sum + item

    return !(array.length === 0)
        ? array.reduce(reducer, 0) / array.length
        : 0
}

module.exports = { reverse, average, }