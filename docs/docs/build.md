# How can build the Hyvä React Checkout
In the build process, you are making the react application ready for use as a Magento module.

In a normal circumstance, you don't need to do this process. However, if you want to customize
the react app in a way you needed, then you need to alter the react components by your own. In this
case, knowing the build process is necessary in order to get your changes reflected in the site.

## How can you build the app

- Go to reactapp directory

        cd src/reactapp/

- Run build command

        NODE_ENV=production npm run build

Here it is assumed you already installed the dependencies by running `npm install` command.