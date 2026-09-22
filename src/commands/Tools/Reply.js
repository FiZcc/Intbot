import discord
from discord.ext import commands
import json
import os

# Setup intents (required for discord.py v2.x)
intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

DATA_FILE = "replies.json"

def load_replies():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return {}

def save_replies():
    with open(DATA_FILE, "w") as f:
        json.dump(keyword_replies, f, indent=4)

keyword_replies = load_replies()

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user} (ID: {bot.user.id})')
    print('------')

@bot.command(name='setreply')
@commands.has_permissions(manage_messages=True)  # Restrict to moderators/admins
async def set_reply(ctx, keyword: str, *, reply: str):
    """Sets a custom reply: !setreply hello Hi there!"""
    keyword_replies[keyword.lower()] = reply
    save_replies()
    await ctx.send(f'✅ Reply for **{keyword}** has been set.')

@bot.command(name='removereply')
@commands.has_permissions(manage_messages=True)
async def remove_reply(ctx, keyword: str):
    """Removes a reply: !removereply hello"""
    keyword_low = keyword.lower()
    if keyword_low in keyword_replies:
        del keyword_replies[keyword_low]
        save_replies()
        await ctx.send(f'🗑️ Reply for **{keyword}** removed.')
    else:
        await ctx.send(f'❌ No reply found for "{keyword}".')

@bot.command(name='listreplies')
async def list_replies(ctx):
    """Shows all active keywords"""
    if not keyword_replies:
        return await ctx.send("No keyword replies set yet.")
    
    formatted_list = "\n".join([f"• **{k}**: {v}" for k, v in keyword_replies.items()])
    await ctx.send(f"**Current Custom Replies:**\n{formatted_list}")

@bot.event
async def on_message(message):
    if message.author.bot:
        return

    msg_content = message.content.lower()
    for keyword, reply in keyword_replies.items():
        if keyword in msg_content:
            await message.channel.send(reply)
            return  # Reply once per message

    await bot.process_commands(message)

@set_reply.error
async def set_reply_error(ctx, error):
    if isinstance(error, commands.MissingRequiredArgument):
        await ctx.send("❌ Usage: `!setreply [keyword] [message]`")

# To run your bot, uncomment and add your token:
# bot.run('YOUR_BOT_TOKEN')
