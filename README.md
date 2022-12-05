# CAPP30239_FA22

## Description
This repository contains all the homework assignments completed as part of CAPP30239 Data Visualization for Public Policy.

### Homwork Assignments
- /week_03: A bar chart exercise for data on library visits in 2022.
- /week_04: A line chart exercise for interest rates in Canada in 2020.

### Final Project
The final project is found in the /final_project directory. This project analyzes 2020 data from the American Community Survey (ACS),
obtained from <a href="https://data.census.gov/table?q=s0802&g=0400000US17$8600000&tid=ACSST5Y2020.S0802&moe=true&tp=false">census.gov</a>.
It explores the different modes of transportation taken to work by Chicago residents across zipcodes, and the disparities in
time taken to travel to work.

#### final_project/
* final_project.html: HTML file for rendering the data visualization project
* styles.css: Style formatting for final_project.html
* choropleth_commute_times.js: Script to create a choropleth for commute times across Chicago
* choropleth_earnings.js: Script to create a choropleth for median earnings across Chicago
* choropleth_poverty.js: Script to create a choropleth for % residents living below 100% of the poverty line across Chicago
* choropleth_race.js: Script to create a choropleth for % Black residents across Chicago
* grouped_bar_race.js: Script to create a grouped bar chart showing % of each race group in overall Chicago population and % in each race
group that take public transportation
* line_chart_ridership_multiple.js: Script to create a line chart for CTA ridership
* modes_of_transport_donut.js: Script to create a donut chart showing breakdown of modes of transportation

#### Datasets (final_project/data/)
All the datasets used to create the visualizations for the project are found in the final_project/data/ directory.
* CTA_ridership_weekdays_annual_average.csv: Data from <a href="https://data.cityofchicago.org/Transportation/CTA-Ridership-Daily-Boarding-Totals/6iiy-9s97/data">Chicago Data Portal</a> on daily bus, rail and total ridership on the CTA between 2001 and 2022. The data has been aggregated and averaged
to obtain annual average ridership.
* mean_travel_time.csv: ACS data on mean travel time to work for public transportation users, by zipcode
* median_earnings_by_zip.csv: ACS data on median earnings by zipcode
* mode_of_transport_donut.csv: ACS data on breakdown of modes of transportation to work in overall Chicago population
* poverty_status_by_zip.csv: ACS data on % living below 100% of the poverty line by zipcode
* race.csv: ACS data on % of each race group that take public transportation to work
* race_by_zipcode.csv: ACS data on % of residents who are Black in each zipcode

#### Libs (final_project/libs/)
* d3-color-legend: Script containing functions to create legends and swatches in the charts
* chicago_boundaries_zipcodes: Geojson file used to create the choropleth charts
