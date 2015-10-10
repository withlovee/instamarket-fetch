var CommentController = {};

// Required Libs
var Q = require("q");
var mongoose = require('mongoose');

// Load Config
var config = require('./config.js');
var clientId = config.clientId;

// Load Models
var Comment = require('./models/comment.js')(mongoose);
var User = require('./models/user.js')(mongoose);

// Connect to DB
mongoose.connect(config.mongoConnection);

CommentController.findAds = function(limit){
  var deferred = Q.defer();

  Comment.find({ads: 1})
  // .limit(2)
  .select({_id: 0, from: 1})
  .exec(function(err, results){
    if(err){
      deferred.reject('Error 1')
    } else {
      
      // console.log(results);
      deferred.resolve(results);

      // Print result
      for(i in results){
        // console.log(results[i].from.username + '&' + results[i].from.id);
        CommentController.markShop(results[i].from.id);
      }
    }
  });

  return deferred.promise;
};

// ids = ['370487981' ,'1484851028' ,'621849450' ,'676561744' ,'1626377299' ,'1569672305' ,'1473916523' ,'1569672305' ,'1622418726' ,'1198284084' ,'360329327' ,'317266342' ,'1602889499' ,'1565677063' ,'28981643' ,'33188944' ,'1612745119' ,'1545748842' ,'284719065' ,'934465977' ,'1591462430' ,'1286037875' ,'1453116655' ,'1403154969' ,'1544824271' ,'1532226570' ,'1381928530' ,'1582472798' ,'1142711572' ,'905929075' ,'1571666461' ,'34419032' ,'1286037875' ,'1560308631' ,'1437619743' ,'1591642875' ,'1465096651' ,'1399953485' ,'1467234061' ,'1569672305' ,'1544824271' ,'1142711572' ,'1505151512' ,'25741300' ,'1453116655' ,'1575576495' ,'1544824271' ,'1547394320' ,'1524821161' ,'5842028' ,'1426717005' ,'370341812' ,'297097972' ,'1329560790' ,'1329560790' ,'1329560790' ,'1329560790' ,'1329560790' ,'1329560790' ,'1695195384' ,'1222785782' ,'628397098' ,'628397098' ,'1461628517' ,'1503977637' ,'1351685975' ,'1471435843' ,'476704797' ,'1444239139' ,'1494406441' ,'515496739' ,'1532105902' ,'1586122222' ,'1566349189' ,'190433956' ,'1438592789' ,'1205275364' ,'346970568' ,'1197541570' ,'1212045540' ,'51150117' ,'693209830' ,'1471343393' ,'528226803' ,'1399691207' ,'1442155974' ,'637360889' ,'593790515' ,'808747842' ,'44814910' ,'301020672' ,'1369366606' ,'31889825' ,'312715586' ,'291889398' ,'1532105902' ,'1980523443' ,'1161050910' ,'1752566870' ,'546040327' ,'1008919139' ,'1135290089' ,'28406329' ,'28551184' ,'380786009' ,'367626562' ,'1793314279' ,'365532693' ,'311996410' ,'1411671868' ,'1326351515' ,'1377647979' ,'1284248313' ,'652024241' ,'1284418910' ,'1247860711' ,'25279740' ,'1337883182' ,'1371725925' ,'1353596706' ,'1286093031' ,'403978317' ,'300320254' ,'293032269' ,'1332326766' ,'1355640090' ,'1394343298' ,'30647592' ,'1340981947' ,'1073382765' ,'271243527' ,'1298555604' ,'1452988402' ,'272826579' ,'1408934134' ,'1495712867' ,'425946612' ,'1649603104' ,'1399953485' ,'224657096' ,'1557261589' ,'1560284443' ,'1551114612' ,'1584338673' ,'1192206007' ,'492576138' ,'1369834371' ,'1245517348' ,'504533508' ,'370487981' ,'1461628517' ,'1918605931' ,'1292055184' ,'397178001' ,'1365500267' ,'198469098' ,'1328370395' ,'1145726791' ,'1452445463' ,'1906814984' ,'1422239088' ,'287848052' ,'224657096' ,'459800286' ,'1522543013' ,'1501473394' ,'1304920762' ,'1430920721' ,'1371723920' ,'431138408' ,'1355640090' ,'478469200' ,'352313777' ,'1355640090' ,'235348520' ,'1450521992' ,'1395893233' ,'1814832869' ,'1325591002' ,'1573530101' ,'407985116' ,'512662255' ,'1417434493' ,'187601373' ,'297897015' ,'366884591' ,'981972779' ,'1397204665' ,'232651858' ,'1469736281' ,'53597043' ,'303899349' ,'1150971182' ,'1477938720' ,'1462176695' ,'52461034' ,'479050083' ,'1403520090' ,'1366562757' ,'1309855800' ,'180860224' ,'1222437487' ,'1571256529' ,'1820409401' ,'25400417' ,'1354268002' ,'1401425603' ,'666625943' ,'442489663' ,'1354268002' ,'1148380423' ,'1538325610' ,'318803816' ,'1354268002' ,'593132298' ,'1528309714' ,'1528309714' ,'347945294' ,'1263841196' ,'1321128328' ,'1338273199' ,'431138408' ,'781646351' ,'310770686' ,'345964772' ,'1509930792' ,'567866011' ,'47814636' ,'2117212028' ,'35983509' ,'459235091' ,'377752532' ,'1597687869' ,'1602843138' ,'1451512924' ,'1139658231' ,'1479888474' ,'1526768777' ,'1447205528' ,'489898109' ,'267872872' ,'316950920' ,'1444397004' ,'1444405246' ,'1181255349' ,'555104076' ,'694494940' ,'422458963' ,'36123330' ,'1414739443' ,'1329850157' ,'1423136423' ,'46034209' ,'404991243' ,'511427687' ,'487575930' ,'180860224' ,'1577914636' ,'1562469970' ,'224657096' ,'1696646068' ,'1597052608' ,'1375717671' ,'1473638671' ,'1343755310' ,'501057896' ,'1281348235' ,'1591583375' ,'195173040' ,'258789087' ,'1501419787' ,'1449376847' ,'1075978140' ,'1467648393' ,'20632148' ,'817457473' ,'1389238938' ,'496825297' ,'495412982' ,'1688974552' ,'1140075437' ,'1494889270' ,'43884594' ,'1697821169' ,'1637595385' ,'593790515' ,'640451327' ,'316298706' ,'1124159950' ,'35983509' ,'1185660690' ,'175340114' ,'1307263846' ,'197540574' ,'200142412' ,'25730810' ,'1351767121' ,'1376279877' ,'1760895980' ,'1548599108' ,'257623303' ,'2105728981' ,'1412621152' ,'1536431845' ,'1321984752' ,'1298516049' ,'437889198' ,'1817793323' ,'1255929471' ,'410808303' ,'1707252576' ,'473183347' ,'1643620354' ,'1664831217' ,'1354268002' ,'770446566' ,'1623785776' ,'584298107' ,'215360895' ,'1429559919' ,'1594042862' ,'1388735433' ,'1572634226' ,'1561070284' ,'285543757' ,'1438131814' ,'947799225' ,'593132298' ,'217659861' ,'1495538473' ,'20541327' ,'1277010051' ,'1130335220' ,'1479102640' ,'1273874734' ,'1294178150' ,'1433586109' ,'1405059088' ,'201376237' ,'502203863' ,'240990166' ,'190148423' ,'1250293231' ,'1270919774' ,'1234865946' ,'28551184' ,'284259887' ,'174041992' ,'459065856' ,'576932657' ,'1404585309' ,'431138408' ,'1950089563' ,'194240728' ,'224657096' ,'1536431845' ,'1611946129' ,'1151093633' ,'1143038695' ,'1427424635' ,'1521715459' ,'1445074980' ,'443583934' ,'18445424' ,'1340104331' ,'1113970321' ,'1694338532' ,'344843622' ,'174350496' ,'504143971' ,'178458770' ,'1674571795' ,'517346062' ,'27494997' ,'297346060' ,'237079042' ,'1837428052' ,'864223763' ,'570749716' ,'1538015561' ,'197504578' ,'1465195258' ,'1599588015' ,'1509879680' ,'502725803' ,'1445055365' ,'145375863' ,'174307448' ,'257623303' ,'611951438' ,'257623303' ,'995630364' ,'1452071786' ,'428837887' ,'1490240016' ,'1797226800' ,'1384879767' ,'1059917128' ,'1344424017' ,'1006126573' ,'1697677879' ,'224657096' ,'1389819816' ,'1473451654' ,'266412118' ,'11541252' ,'1158162667' ,'3276433' ,'499533663' ,'728477295' ,'225484509' ,'1542486602' ,'1342402888' ,'1016591166' ,'1321678170' ,'1294178150' ,'888268114' ,'685278701' ,'213933186' ,'1124045404' ,'2062136728' ,'1590411958' ,'1635470704' ,'1655138444' ,'1591472523' ,'308426667' ,'1145005847' ,'1410555543' ,'325579434' ,'370363156' ,'217265523' ,'1430876949' ,'1081968869' ,'647844545' ,'297579022' ,'1397351691' ,'1824287181' ,'174350496' ,'1468734732' ,'903207796' ,'383575916' ,'380786009' ,'416946637' ,'1598384549' ,'1443462828' ,'1494440658' ,'1432746666' ,'614439656' ,'1380146062' ,'5382424' ,'1612745119' ,'403740178' ,'1501478415' ,'25741300' ,'1347943485' ,'9729945' ,'1432448295' ,'1650888340' ,'24393749' ,'1522111627' ,'1666539518' ,'1633849824' ,'1231886075' ,'1452988402' ,'1476669037' ,'1452988402' ,'1294178150' ,'176170967' ,'231679657' ,'388393452' ,'356389064' ,'25741300' ,'1452988402' ,'343143662' ,'50719995' ,'423481966' ,'1379491277' ,'1314659257' ,'891474602' ,'1601911386' ,'1555388232' ,'1146011812' ,'1437619743' ,'29230619' ,'1316644779' ,'1437741482' ,'1537602097' ,'1412770556' ,'541147816' ,'1580092542' ,'2125001211' ,'1506872184' ,'1642554511' ,'1447123945' ,'393010360' ,'1508728128' ,'1073382765' ,'1575712016' ,'1390749157' ,'1190195448' ,'1526248987' ,'933850283' ,'1415403182' ,'1447855901' ,'33871908' ,'43884594' ,'359398306' ,'858425588' ,'417058015' ,'1216437354' ,'1364095584' ,'498367245' ,'1185660690' ,'914494345' ,'1508428339' ,'44814910' ,'1335948482' ,'267440029' ,'1422016564' ,'275956555' ,'1713041122' ,'187597666' ,'1248588623' ,'297346060' ,'5842028' ,'905802802' ,'1363827488' ,'1363827488' ,'770446566' ,'969344703' ,'18201251' ,'554663605' ,'1100545007' ,'344721107' ,'1425081795' ,'1506983557' ,'45764004' ,'1294178150' ,'1195406460' ,'482948588' ,'1148283184' ,'11541252' ,'1463115003' ,'1328667537' ,'1362520517' ,'1331718726' ,'1648532308' ,'1460279882' ,'502466244' ,'1329585928' ,'29094360' ,'1441162001' ,'1595900037' ,'1423347092' ,'705640891' ,'1401006281' ,'1736326458' ,'194240728' ,'1354068312' ,'1352204048' ,'1456183030' ,'1433834189' ,'1365051718' ,'225484509' ,'1437087823' ,'40691581' ,'1767955858' ,'173603482' ,'1473589166' ,'284826212' ,'1467462179' ,'1452741568' ,'1352638824' ,'21422083' ,'316931921' ,'1761768447' ,'307892903' ,'216374213' ,'1258185180' ,'1477198962' ,'1528244736' ,'340645584' ,'224657096' ,'1461628517' ,'176170967' ,'224657096' ,'1461628517' ,'39157086' ,'1363724448' ,'13830146' ,'318245174' ,'195451838' ,'1642356910' ,'1393103765' ,'202638242' ,'1511896834' ,'555200821'];
// ids = ['370487981'];

CommentController.markShop = function(id){
  var deferred = Q.defer();

  User.update({id: id}, { $set: { is_shop: 1, is_shop_verified: true } }, { multi: false }, function(err, raw) {
    if(err) {
      console.log(err);
      console.log('Error: ' + id);
      // deferred.reject(err);
    }
    else{
      console.log('Saved: ' + id);
      // deferred.resolve();
    }
  });
}

module.exports = CommentController;

CommentController.findAds();
