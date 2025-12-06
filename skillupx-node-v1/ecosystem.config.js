module.exports = {
  apps : [{
    script: 'src/server.js',
    watch: '.'
  }, {
    script: './service-worker/',
    watch: ['./service-worker']
  }],

  deploy : {
    production : {
      user : 'root',
      host : '31.97.233.174',
      ref  : 'origin/main',
      repo : 'git@github.com:ritzzh/skillupx.git',
      path : '/var/www/node-backend',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
