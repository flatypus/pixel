# pixel

[A simple pixel view tracker.](https://view.flatypus.me)

## How it works

When a website is visited, the browser needs to request media from outside sources. This project serves a 1x1 transparent pixel image at a specific route, such that when the browser requests the image, the server can log the request and track the view. By using a unique id in the route, the server can track views for different pages:

Embed `<img src="https://pixel.flatypus.me/[id]">` to start tracking that id. You could also embed `![](https://pixel.flatypus.me/[id]?type=tracker)` in a .md to track on markdown pages, such as this one.

To view statistics, go to `https://view.flatypus.me/[id]` to view stats.

But how would you know who or what website is requesting the image? Simple: on each request, it includes a `Referer` header, which tells the server where the request is coming from. I log that site, and allows you to sort the stats by the route.

You could even go a step further! By specifically adding `<img src="https://pixel.flatypus.me/[id]" referrerpolicy="unsafe-url">` to your page, you'll also be able to get the specific full URL, including sorting by paths, of the page that requested the image.

![](https://pixel.flatypus.me/a16be4b2-ae3b-40f7-a946-8c8eaf540670?type=tracker)
<img width="1487" alt="image" src="https://github.com/flatypus/pixel/assets/68029599/2751fb76-e486-4cf9-ab71-1d2225974d97">

<img width="1243" alt="image" src="https://github.com/flatypus/pixel/assets/68029599/a79e062d-ce4e-4a53-9c20-1373c51c3c85">

<img width="1243" alt="image" src="https://github.com/flatypus/pixel/assets/68029599/473c4734-5ee9-479a-a230-9245579eabae">

