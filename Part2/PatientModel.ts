import * as moment from 'moment'; 
interface Entry {
    id?: string;
    deleted?: boolean;
    value?: number;
    type?: string;
    status?: string;
    ts?: number;
}

/* I would make some of the properties of the interfaces required because this is an health application and I
feel that the more relevant information the doctor has, the better the care will be for the patient. Also, since none of the 
properties are required for the interfaces, a developer might forget to include important properties for classes they're
working on.
*/

interface EntryWrapper {
    data?: Entry[];
}

interface PatientResponseDataInterfaces {
    metrics: {
        temperature?: EntryWrapper;
        weight?: EntryWrapper;
        bloodpressure?: EntryWrapper;
    };
    ts: number;
}

class PatientModel {
    public recentMetrics: {
        bloodpressureLast?: EntryWrapper;
        bloodpressureToday?: EntryWrapper;
        temperatureLast?: EntryWrapper;
        temperatureToday?: EntryWrapper;
        weightLast?: EntryWrapper;
        weightToday?: EntryWrapper;
    } = {};

    /*
        This function is basically a log of the patient's information(weight, blood pressure, temperature, etc.) The purpose of the filterLatestReadings is to retrieve the most recent readings, and sort them by time from the most recent to the earliest. If any entries were deleted for any reason, those readings aren't shown in the log.

    */
    private filterLatestReadings(overviewData: PatientResponseDataInterfaces[], metric: string): any {
        let readings = {};
        overviewData.forEach((day) => {
          
            let entry = day.metrics[metric];
                /*
                 I would use destructuring here and any other place a long
                variable appears because the bracket notation mixed with the template literals
                are hard to follow and using destructuring can increase readability 
                - const { readingsFromToday } = this.recentMetrics[`${metric}Today`], 
                  const { lastReadings } = this.recentMetrics[`${metric}Last`]
                */
            if ((this.recentMetrics[`${metric}Today`] && this.recentMetrics[`${metric}Last`]) ||
                (readings[`${metric}Today`] && readings[`${metric}Last`])) {
                return;
            }
            if (entry.data) {
                /*
                  I would create another function to filter and sort the entries since 
                    this function has a alot of moving parts - filterReadings(entry){}
                */

                // Filter out deleted entries, and sort remaining by timestamp in descending order
                entry.data = entry.data.filter((entry) => (entry.status !== 'removed' && !entry.deleted));

                /*
                    I would remove this line and change if(entry.data) to if(entry.data.length) since
                    it appears that entry.data needs to be an array, and doing this would free up a few
                    lines of code
                 */
                if (!entry.data.length) {
                    return;
                }
                entry.data.sort((entry1, entry2) => entry2.ts - entry1.ts);
                // Assign the last reading if today's exists already.
                if (readings[`${metric}Today`] && !readings[`${metric}Last`]) {
                    readings[`${metric}Last`] = entry.data[0];
                } 
                
                else {
                    // Make sure reading was entered today, else save an empty object as today's reading
                    readings[`${metric}Today`] = (moment().diff(entry.ts, 'days') === 0) ? entry.data[0] : {};
                }
                // If there are multiple entries, and today's reading has been assigned,
                // assign the second to last entry as the last reading
                if (entry.data[1] && readings[`${metric}Today`] && !readings[`${metric}Last`]) {
                    readings[`${metric}Last`] = entry.data[1];
                }
            } 
            
            else {
               
                if (entry && entry.ts && !entry.deleted && entry.status !== 'removed') {
                    if (moment().diff(day.ts, 'days') < 1) {
                        if (!readings[`${metric}Today`]) {
                            readings[`${metric}Today`] = entry;
                        }
                    } 
                    else {
                        if (!readings[`${metric}Last`]) {
                            readings[`${metric}Last`] = entry;
                        }
                    }
                }
            }
        });
        return readings;
    }
    
}
