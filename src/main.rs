use reed_solomon_rs::fec::fec::*;
use std::fs::{self, File};
use std::io::{self, Read, Write};
use std::path::Path;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let required = 12; // Number of pieces required for reconstruction
    let total = 24; // Total number of pieces to generate
    let fec = FEC::new(required, total)?;

    println!("Enter the name of the file (located in 'input/' folder) you want to encode:");
    let mut input_file = String::new();
    io::stdin().read_line(&mut input_file)?;
    let input_path = format!("input/{}", input_file.trim());

    // Step 1: Read the input file
    let data = fs::read(&input_path)?;
    println!("Read {} bytes from {}", data.len(), input_path);

    // Step 2: Encode the data into shares
    let mut shares: Vec<Share> = vec![
        Share {
            number: 0,
            data: vec![]
        };
        total
    ];
    let output = |s: Share| {
        shares[s.number] = s.clone(); // Deep copy of the share
    };
    fec.encode(&data, output)?;

    // Step 3: Save the shares to the 'shares/' folder
    fs::create_dir_all("shares")?;
    for (i, share) in shares.iter().enumerate() {
        let share_path = format!("shares/share_{}.bin", i);
        let mut file = File::create(&share_path)?;
        file.write_all(&share.data)?;
        println!("Saved share to {}", share_path);
    }

    println!(
        "\nEncoding complete. You can simulate corruption by modifying any of the share files.\n"
    );

    // Step 4: Ask the user to provide paths to the shares for decoding
    let mut share_paths = vec![];
    for i in 0..total {
        println!(
            "Enter the path for share {} (default: 'shares/share_{}.bin', press Enter to skip):",
            i, i
        );
        let mut share_path = String::new();
        io::stdin().read_line(&mut share_path)?;
        let share_path = share_path.trim();
        if !share_path.is_empty() && Path::new(share_path).exists() {
            share_paths.push(share_path.to_string());
        } else if share_path.is_empty() && Path::new(&format!("shares/share_{}.bin", i)).exists() {
            share_paths.push(format!("shares/share_{}.bin", i));
        }
    }

    println!("Share paths: {:?}", share_paths);

    if share_paths.len() < required {
        println!(
            "Not enough shares provided for reconstruction. At least {} shares are needed.",
            required
        );
        return Ok(());
    }

    // Step 5: Load the provided shares
    let mut loaded_shares = vec![];
    for path in share_paths.iter() {
        let mut file = File::open(path)?;
        let mut share_data = vec![];
        file.read_to_end(&mut share_data)?;
        // Extracting the share number from the file name
        let number = path
            .split('_')
            .last()
            .unwrap()
            .split('.')
            .next()
            .unwrap()
            .parse::<usize>()?;
        loaded_shares.push(Share {
            number,
            data: share_data,
        });
    }

    // Step 6: Attempt to decode the shares
    match fec.decode(vec![], loaded_shares) {
        Ok(result_data) => {
            // Step 7: Write the reconstructed data to the 'output/' folder
            fs::create_dir_all("output")?;
            let output_path = "output/reconstructed_file.bin";
            let mut output_file = File::create(output_path)?;
            output_file.write_all(&result_data)?;
            println!("Decoded and saved the file as {}", output_path);
        }
        Err(e) => {
            println!("Failed to decode the shares: {}", e);
        }
    }

    Ok(())
}
