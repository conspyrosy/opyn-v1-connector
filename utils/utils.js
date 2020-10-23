module.exports = {
    /**
     * Converts a scientific number format to a floating point
     * floating point number = value * 10 ** exponent
     *
     * @param scientificNumber { value, exponent } to fit equation above
     */
    convertToFloatingPoint: (scientificNumber) => {
        return scientificNumber.value * Math.pow(10, scientificNumber.exponent)
    }
}