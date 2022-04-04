# Certbot and SSL renewal

[![Let's Encrypt Logo](https://letsencrypt.org/images/letsencrypt-logo-horizontal.svg)](https://letsencrypt.org/)

Encrypting web traffic is very important and there is no excuse not to use it. One of the simplest ways to get HTTPS working on your website is to make use of [Let's Encrypt](https://letsencrypt.org/). The best way to install a Let's Encrypt certificate is by using [Certbot](https://certbot.eff.org/). Certbot is a tool that will generate the certificates through letsencrypt, and set up cron jobs for the automatic renewal of those certificattes.

While certbot is available natively via some package managers, [it is recommend](https://certbot.eff.org/instructions?ws=other&os=ubuntufocal) that you install the snap version of the application.

Certbot also gives you the ability to hook into the renewal command processs with a `--post-hook` command. Basically it is just a command that will run after the certificate update happens.

This is important because we need to make sure to restart the server to refresh the SSL keys from the disk. This is because the contents of the key files are loaded in from disk when the server is started.

``` bash
certbot renew --post-hook "/root/.nvm/versions/node/v16.14.2/bin/npm --prefix /root/gibsdev.com restart"
```

Above is the command that I used for registering a `--post-hook` command to run after the cerrtificate update:

The important thing to note here is you must use absolute paths to commands otherwise certbot will throw a warning that the command does not exist. The simplest way to convert your command is by using the `which <command>` to get the location of the command you are trying to run.

IMPORTANT NOTE (and the reason I made this post): Since we need to use absolute paths for commands, updating the nodejs version could cause this command to fail in the future if it tries to reference the wrong version (`v16.14.2`) in this case.

Now hopefully I will remember that I made this post when I try to figure out why SSL is not working correctly in the future...
