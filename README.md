# Results Viewer 👓

This repo contains the code for the results-viewing portion of our Senior Design project.

## Goals

The goal is to present the data in a creative and meaningful way. 

* A map with the info overlayed
  * Heatmap of trends that we discover
  
  
## Viewing the results

Currently it is all contained in the one file [results.html](/results.html).

Simple open that file in any modern browser.
  
## Implementation Details

This is set up to use the [Google Maps API](https://developers.google.com/maps/documentation/javascript/?authuser=1). The API key came from Jordan Shurmer's `vols.utk.edu` account.

# Project Description

Counties levy a tax on a home to pay for schools, libraries, roads, and many other things the community needs. The question is, does everyone pay their fair share?

Suppose the tax is based on the sale price of the home. Then somebody living in a house for many years pays too little, as their home value goes up from what they paid. How do we do know if that’s the case or what the economic impact is? Well, property taxes are publicly available and a number of web sites list what they call fair market values of homes; it would be interesting to correlate the two. Public websites also list sales prices of homes; it would also be interesting to use current neighborhood sales prices to determine fair market values of homes (do houses of the same size, age and location pay the same taxes etc?).

The task is to develop a software tool that gathers relevant numbers, performs analysis, and presents scenarios to the county government for what-if scenarios. One such would be to determine a histogram of fair share property tax payments and compare them against the current taxes. Another would be to analyze the data for neighborhood trends. Maybe some neighborhoods need a break while others don’t? This is where you use your imagination and good citizen skills. Visualizing the results on a map would be very helpful. The suggestion is to start with Knox County and expand to the US at large. We may form a non-profit corporation if the bucket holds water.
