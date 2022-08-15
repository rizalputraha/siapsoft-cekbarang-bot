require('dotenv').config()
const { Telegraf } = require('telegraf')
const cron = require('node-cron')

const bot = new Telegraf(process.env.BOT_TOKEN)

var knex = require('knex')({
    client: 'mssql',
    connection: {
        server : process.env.DB_HOST,
        user : process.env.DB_USERNAME,
        password : process.env.DB_PASSWORD,
        database : process.env.DB_DATABASE,
        options: {
            port: Number(process.env.DB_PORT)
        }
    }
});

const dateNow = () => {
    const d_t = new Date();
 
    let year = d_t.getFullYear();
    let month = ("0" + (d_t.getMonth() + 1)).slice(-2);
    let day = ("0" + d_t.getDate()).slice(-2);
    let hour = d_t.getHours();
    let minute = d_t.getMinutes();
    let seconds = d_t.getSeconds();

    // prints date & time in YYYY-MM-DD HH:MM:SS format
    return "["+year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + seconds+ "] :";
}

//SiapBintangTeknik
cron.schedule("*/10 * * * *", async () => {
    try {
        var message = '';
        var query = await knex.raw("select a.kodebrg,b.NAMABRG,a.serialmanual,c.NamaGdg, sum(sisasatkecil) Sisa from dbvregbrgserial a left outer join dbbarang b on b.kodebrg=a.kodebrg left outer join dbgudang c on c.KodeGdg=a.kodegdg group by a.kodebrg,a.serialmanual,c.NamaGdg,b.NAMABRG having sum(sisasatkecil) < 0")
        query.map((item) => {
            message = message + `Kode Barang: ${item.kodebrg}, \nNama Barang: ${item.NAMABRG}, \nGudang: ${item.NamaGdg}, \nSerialManual: ${item.serialmanual} \nSisa: ${item.Sisa}` + '\n\n';
        })
        if (query.length > 0) {
            bot.telegram.sendMessage("-672619963", message);
            console.log(dateNow() + message);
        }
    } catch (error) {
        bot.telegram.sendMessage("-672619963", "Something Went Wrong Please Check Code !");
    }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))