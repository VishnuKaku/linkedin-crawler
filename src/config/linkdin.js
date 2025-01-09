// src/config/linkedin.js
const LinkedInAuth = {
    async login(page, credentials) {
      await page.goto('https://www.linkedin.com/login');
      await page.waitForSelector('#username');
      
      // Type slowly to avoid detection
      await page.type('#username', credentials.email, { delay: 100 });
      await page.type('#password', credentials.password, { delay: 100 });
      
      await Promise.all([
        page.click('.login__form_action_container button'),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]);
      
      // Verify login success
      const isLoggedIn = await page.evaluate(() => {
        return !!document.querySelector('.global-nav__me-photo');
      });
      
      if (!isLoggedIn) {
        throw new Error('LinkedIn login failed');
      }
    }
  };
  
  module.exports = LinkedInAuth;