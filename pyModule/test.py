import json
import csv
import pandas as pd
import xgboost as xgb
from random import randint
import time
import numpy as np
import sys

# filename = '../userJson/anjoy.json'
filename = sys.argv[1]
jsonFile = open(filename).read()
jsonData = json.loads(jsonFile)

dfData = pd.DataFrame.from_dict(jsonData)

csvData = pd.DataFrame(dfData)
length = int(dfData.size/5)
maxSp = 0
for i in range(0,16):
    tmp1 = csvData.sleepTime[i]
    t = tmp1.split(":")
    shr = int(t[0])*60+int(t[1])
    csvData.sleepTime[i] = shr
    if(shr<720 ):
        if(shr>maxSp):
            maxSp = shr
    
    tmp2 = csvData.exerTime[i]
    tt = tmp2.split(":")
    ehr = int(tt[0])*60+int(tt[1])
    csvData.exerTime[i] = ehr
    
    tmp3 = csvData.lastEat[i]
    ttt = tmp3.split(":")
    lhr = int(ttt[0])*60+int(ttt[1])
    csvData.lastEat[i] = lhr
    
csvData.to_csv('anjoy.csv', header=False, index=False)

maxScore = dfData.loc[dfData['score'].idxmax()].score
maxCoffee = dfData.loc[dfData['coffee'].idxmax()].coffee
plusScore = maxScore + 5

maxSpHr = int(maxSp/10)

# test data create
cf = open('test.csv', 'w', encoding='utf-8') 
wr = csv.writer(cf)
wr.writerow(['score', 'sleepTime','coffee', 'exerTime', 'lastEat'])
for i in range(0, 6):
    score = maxScore + i +1
    
    for j in range(0, 200):
        #create sleepTime test data
        sp = randint(7,(36+maxSpHr))
        hr = int(sp/6)
        if(hr<6):
            hr = 18+hr
        else:
            hr = hr-6
        min = (sp%6)*10
        sleepTime = hr*60+min
        
        #create coffee test data
        coffee = randint(0,maxCoffee)
        
        #create exerTime test data
        et = randint(0,30)
        exerTime = int(et/6)*10+(et%6)*10
        
        #create lastEat testdata
        le_lim = sp - 6
        le = randint(0,le_lim)
        ehr = int(le/6)
        if(ehr<6):
            ehr = 18+ehr
        else:
            ehr = ehr-6
        min = (le%6)*10
        lastEat = ehr*60+min
        
        #write row in file
        wr.writerow([score, sleepTime, coffee, exerTime, lastEat])
    
cf.close()

test_df = pd.read_csv('test.csv')

dtrain = xgb.DMatrix('anjoy.csv?format=csv')
dtest = xgb.DMatrix('test.csv?format=csv')

param = {'silent':1, 'objective':'binary:logistic', 'booster':'gblinear',
         'alpha': 0.0001, 'lambda': 1}

watchlist = [(dtest, 'eval'), (dtrain, 'train')]
num_round = 4
bst = xgb.train(param, dtrain, num_round, watchlist)
preds = bst.predict(dtest)
labels = dtest.get_label()

result_array = []
max_tmp = 0.0
max_index = 0

for i in range(len(preds)):
    if(preds[i]>max_tmp):
        max_tmp = preds[i]
        max_index = i

# if(int(test_df.loc[max_index].sleepTime/60)<10):
# 	c_sleepTime = '0'+str(int(test_df.loc[max_index].sleepTime/60))+'시 '+str(int(test_df.loc[max_index].sleepTime%60))+'분'
# else:
# 	c_sleepTime = str(int(test_df.loc[max_index].sleepTime/60))+'시 '+str(int(test_df.loc[max_index].sleepTime%60))+'분'

# if(int(test_df.loc[max_index].exerTime/60)<10):
# 	c_exerTime = '0'+str(int(test_df.loc[max_index].exerTime/60))+'시간 '+str(int(test_df.loc[max_index].exerTime%60))+'분'
# else:
# 	c_exerTime = str(int(test_df.loc[max_index].exerTime/60))+'시간 '+str(int(test_df.loc[max_index].exerTime%60))+'분'
# if(int(test_df.loc[max_index].lastEat/60)<10):
# 	c_lastEat = '0'+str(int(test_df.loc[max_index].lastEat/60))+'시 '+ str(int(test_df.loc[max_index].lastEat%60))+'분'
# else:
# 	c_lastEat = str(int(test_df.loc[max_index].lastEat/60))+'시 '+str(int(test_df.loc[max_index].lastEat%60))+'분'


# if(int(c_sleepTime)<10):
# 	c_sleepTime = '0'+c_sleepTime
# if(int(c_exerTime)<10):
# 	c_exerTime = '0'+c_exerTime
# if(int(c_lastEat)<10):
# 	c_lastEat = '0'+c_lastEat


c_sleepTime = str(int(test_df.loc[max_index].sleepTime/60))+'시 '+str(int(test_df.loc[max_index].sleepTime%60))+'분'
c_exerTime = str(int(test_df.loc[max_index].exerTime/60))+'시간'+str(int(test_df.loc[max_index].exerTime%60))+'분'
c_lastEat = str(int(test_df.loc[max_index].lastEat/60))+'시 '+str(int(test_df.loc[max_index].lastEat%60))+'분'


print(test_df.loc[max_index].score)
print(c_sleepTime)
print(test_df.loc[max_index].coffee)
print(c_exerTime)
print(c_lastEat)



