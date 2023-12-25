import json
from datetime import datetime

key_name = {
    "2s9HtWaCluVOaCXE2fV6aok5tAI3": "joshlee1128",
    "5e5G2cjX2wRU2DIHDRrW7if4XAr1": "JHGuy",
    "BgEUzpaFYqOhfIYjwV5gDAPE2Yk1": "kingstone",
    "CFrTyUaPUrQyeYjtVaoiIrUcKu62": "Jinhyeok",
    "H3xkemOOqvegCzWfsyDmmsrUK573": "ttoshuzone",
    "HhwumhEqmhSxKl9zv768rBf1zCQ2": "Yunho",
    "U88RtWNTkkPmmPSiHtuo25gSia32": "jlee335",
    "jLR3h9pEemfwYSgCNMbzg99b0h62": "chris",
    "vv4cxpSwrQPC85JpqKAL7SXwfIE3": "HyunjaeStudy",
}

if __name__ == "__main__":
    # open eval.json file
    # read the file

    with open("eval.json", "r") as f:
        eval_data = f.read()

    # convert the json string to a python dictionary
    eval_data = json.loads(eval_data)

    eval_data = eval_data["message"]

    for userKey in eval_data:
        print(userKey)

        # value is list
        for value in eval_data[userKey]:
            # value is dictionary of start_time, end_time
            # start_time, end_time both in have _seconds key.
            # convert _seconds to YYYY-MM-DD HH:MM:SS
            # print(value)
            start_time_s = value["start_time"]["_seconds"]
            end_time_s = value["end_time"]["_seconds"]

            # convert _seconds to YYYY-MM-DD HH:MM:SS
            start_time = datetime.fromtimestamp(start_time_s)
            end_time = datetime.fromtimestamp(end_time_s)

            duration = end_time - start_time

            start_time_format = start_time.strftime("%Y-%m-%d %H:%M:%S")
            end_time_format = end_time.strftime("%Y-%m-%d %H:%M:%S")
            duration_minutes = int(duration.seconds / 60)

            # if user exist in key_name
            if userKey in key_name:
                user_name = key_name[userKey]
                # Save the data to a csv file
                with open("eval.csv", "a") as f:
                    f.write(
                        f"{user_name},{start_time_format},{end_time_format},{duration_minutes}\n"
                    )

                print(start_time_format, end_time_format, duration_minutes)

    pass
