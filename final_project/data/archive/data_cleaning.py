import pandas as pd
import geojson
import csv

ZIPCODES = "zipcodes_clean.csv"
ZIPCODES_GEOJSON = 'chicago_boundaries_zipcodes.geojson'

def clean_data(filename):
    data = pd.read_csv(filename)
    raw_columns = data.columns.tolist()[1:]
    rename_cols = {key: None for key in raw_columns}

    # clean up the column names
    for col in raw_columns:
        new_col = col.replace("ZCTA5 ", "")
        new_col = new_col.replace("Estimate", "")
        new_col = new_col.replace("!!", " ")
        rename_cols[col] = new_col

    new_data = data.rename(columns=rename_cols)

    # keep only zipcodes in Chicago city area
    zipcodes = pd.read_csv(ZIPCODES)["ZIP"].tolist()
    zipcodes = [str(i) for i in zipcodes]
    print(len(zipcodes))

    to_drop = []
    for col in rename_cols.values():
        zip_code = col[:5]
        if zip_code not in zipcodes:
            to_drop.append(col)
    print(f"ZIPCODES TO DROP: {len(to_drop)}")
    new_data.drop(to_drop, axis=1, inplace=True)

    new_data.to_csv("acs_commute_data_final.csv")
    
    return "done"

def public_transport_only(filename):
    data = pd.read_csv(filename, encoding= 'unicode_escape')
    columns = data.columns
    to_drop = []
    new_columns = {}
    for col in columns[1:]:
        if "Public transportation" not in col:
            to_drop.append(col)
        else:
            new_col = col[:5]
            new_columns[col] = new_col

    new_data = data.drop(to_drop, axis=1)
    new_data = new_data.rename(columns=new_columns, inplace=False)
    new_data.to_csv("acs_commute_public_transport_only.csv")

    return "done"

def totals_only(filename):
    data = pd.read_csv(filename, encoding= 'unicode_escape')
    columns = data.columns
    to_drop = []
    new_columns = {}
    for col in columns[1:]:
        if "Total" not in col:
            to_drop.append(col)
        else:
            new_col = col[:5]
            new_columns[col] = new_col

    new_data = data.drop(to_drop, axis=1)
    new_data = new_data.rename(columns=new_columns, inplace=False)
    new_data.to_csv("acs_commute_data_totals.csv")

    return "done"

def get_zipcodes():
    # asssume file is a geojson
    with open(ZIPCODES_GEOJSON) as f:
        data = geojson.load(f)
    
    zipcodes = []
    for area in data['features']:
        zipcode = area['properties']['zip']
        zipcodes.append(zipcode)
    
    # print(zipcodes)
    
    with open(ZIPCODES, 'w') as csvwriter:
        f = csv.writer(csvwriter)
        # for zipcode in zipcodes:
        f.writerow(zipcodes)
    
    return "done"

# RIDERSHIP = 'CTA_ridership_daily_boarding_totals.csv'
# def average_annual_ridership():
    
