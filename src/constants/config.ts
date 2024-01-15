import agrv from 'minimist'
// Kiểm tra xem đang ở môi trường nào
const options = agrv(process.argv.slice(2))
export const isProduction = Boolean(options.production)
