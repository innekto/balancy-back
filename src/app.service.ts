import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `Welcome to Balancyй, the app that'll have you saying, "check!" "Who needs a work-life balance when you can have a 'work, life, and a little bit of crazy' balance!"
      Get ready to track your time, unleash your productivity, and maybe even discover a secret cheat code to squeeze more hours out of the day (just kidding, we wish we had one too).
      With Balancyй, finding equilibrium has never been more entertaining. So grab your coffee, put on your superhero cape, and let's conquer the world while keeping our sanity intact.
      Time to embrace the chaos and balance like a boss!`;
  }
}
