import qrcode

data = "Code with Toushif"

qr = qrcode.make(data)

qr.save("qrcode.png")

print("QR code generated and saved as qrcode.png")