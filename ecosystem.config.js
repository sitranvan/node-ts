// PM2 giúp chúng ta quản lý các process của NodeJS, giúp chúng ta có thể khởi động, dừng, restart, reload, delete các process một cách dễ dàng.
// Cài đặt PM2: npm install pm2 -g
// Chạy file ecosystem.config.js: pm2 start ecosystem.config.js
// Chạy ở môi trường production: pm2 start ecosystem.config.js --env production
// Xem danh sách các process đang chạy: pm2 list
// Xem log của process: pm2 log <process_name>
// Xem số lượng dòng log cần hiển thị: pm2 log <process_name> --lines 100
// Xem log của process theo thời gian thực: pm2 monit
// Dừng process: pm2 stop <process_name>
// Khởi động lại process: pm2 restart <process_name>
// Xóa process: pm2 delete <process_name>
// Xóa tất cả các process: pm2 delete all
module.exports = {
  apps: [
    {
      name: 'twitter',
      script: 'node dist/index.js',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
